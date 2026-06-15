/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import httpStatus from "http-status";
import { Prisma, EventStatus } from "@prisma/client";
import { eventSearchableFields } from "./event.constant";
import { fileUploader } from "../../helper/fileUploader";
import { Request } from "express";
import ApiError from "../../errors/ApiError";
import { extractJsonFromMessage } from "../../helper/extractJsonFromMessage";
import { getFreeFallbackModels, openai } from "../../helper/open-router";
import { IUser } from "../user/user.interface";

const createEvent = async (user: IUser, req: Request) => {
  const host = await prisma.host.findUnique({ where: { userId: user.id } });

  if (!host) throw new ApiError(httpStatus.NOT_FOUND, "Host profile not found.");

  const hostId = user.id;

  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = uploadResult?.secure_url;
  }

  const payload = req.body;

  try {
    const created = await prisma.event.create({
      data: {
        title: payload.title,
        eventType: payload.eventType ?? null,
        description: payload.description,
        hostId: hostId,
        minParticipants: payload.minParticipants ?? null,
        maxParticipants: payload.maxParticipants ?? null,
        image: payload.image ?? null,
        location: payload.location ?? {},
        startDate: new Date(payload.startDate),
        endDate: new Date(payload.endDate),
        joiningFee: payload.joiningFee ?? 0,
        status: EventStatus.OPEN,
      },
    });
    return created;
  } catch (err) {
    console.error("Prisma error →", err);
    throw err;
  }
};

const updateEvent = async (eventId: string, user: IUser, req: Request) => {
  const host = await prisma.host.findUnique({ where: { userId: user.id } });
  if (!host) throw new Error("Host profile not found. Please register as a host first.");

  const hostId = user.id;
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = uploadResult?.secure_url;
  }

  const data: any = { ...req.body };

  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (data.location) data.location = data.location as any;
  data.hostId = hostId;

  return prisma.event.update({
    where: { id: eventId },
    data: data,
  });
};

export const getAISuggestions = async (payload: { interests: string[] }) => {
  if (!payload?.interests || payload.interests.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Interests are required!");
  }

  const rawEvents = await prisma.event.findMany({
    where: {
      status: "OPEN",
      endDate: { gte: new Date() },
      eventType: {
        in: payload.interests,
      },
    },
    select: {
      id: true,
      title: true,
      eventType: true,
      description: true,
      location: true,
      startDate: true,
      joiningFee: true,
      minParticipants: true,
      maxParticipants: true,
      status: true,
      host: {
        select: {
          id: true,
          fullName: true,
          avgRating: true,
          reviewCount: true,
          hostProfile: {
            select: { status: true },
          },
        },
      },
      _count: {
        select: { participants: true },
      },
    },
    take: 20,
  });

  let events = rawEvents;
  if (events.length === 0) {
    const interestsLower = payload.interests.map(i => i.toLowerCase());
    const allOpen = await prisma.event.findMany({
      where: {
        status: "OPEN",
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        eventType: true,
        description: true,
        location: true,
        startDate: true,
        joiningFee: true,
        minParticipants: true,
        maxParticipants: true,
        status: true,
        host: {
          select: {
            id: true,
            fullName: true,
            avgRating: true,
            reviewCount: true,
            hostProfile: { select: { status: true } },
          },
        },
        _count: { select: { participants: true } },
      },
      take: 20,
    });
    events = allOpen.filter(e =>
      e.eventType &&
      interestsLower.includes(e.eventType.toLowerCase())
    );
  }

  const slim = events.map(e => ({
    id: e.id,
    title: e.title,
    eventType: e.eventType ?? "Unknown",
    description: (e.description ?? "").slice(0, 120),
    location: (() => {
      try {
        const loc = typeof e.location === "string"
          ? JSON.parse(e.location)
          : (e.location as Record<string, unknown>);
        return {
          city: loc?.city ?? loc?.formattedAddress ?? "Unknown",
        };
      } catch { return { city: "Unknown" }; }
    })(),
    startDate: e.startDate,
    joiningFee: e.joiningFee ?? 0,
    currentParticipants: e._count.participants,
    maxParticipants: e.maxParticipants,
    hostName: e.host?.fullName ?? "Unknown",
    hostAvgRating: e.host?.avgRating ?? 0,
    hostReviewCount: e.host?.reviewCount ?? 0,
    hostApproved: e.host?.hostProfile?.status === "APPROVED",
  }));

  if (slim.length === 0) {
    return { suggestedEvents: [] };
  }

  const prompt = `You are a JSON-only event recommendation API. You MUST respond with ONLY valid JSON - no explanations, no markdown, no code fences, no text before or after.
 
User interests: ${JSON.stringify(payload.interests)}
 
Available OPEN events: ${JSON.stringify(slim)}
 
Task: Pick the top ${Math.min(3, slim.length)} most relevant events matching the user's interests.
 
RESPOND WITH EXACTLY THIS JSON STRUCTURE AND NOTHING ELSE:
{"suggestedEvents":[{"id":"","title":"","eventType":"","relevanceScore":85,"reason":"2-sentence explanation why this matches the user interests","host":{"id":"","fullName":"","avgRating":0,"reviewCount":0},"location":{"city":""},"startDate":"","joiningFee":0}]}`;

  const models = await getFreeFallbackModels();

  let completion: Awaited<ReturnType<typeof openai.chat.completions.create>> | null = null;
  let lastError = "";

  console.log(`\n🎯 AI matching ${slim.length} events for interests: ${payload.interests.join(", ")}`);

  for (const model of models) {
    try {
      console.log(`  Trying: ${model}`);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 55_000);

      completion = await openai.chat.completions.create(
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a JSON-only API. Respond ONLY with valid JSON matching the exact schema provided. No markdown, no explanations, no code blocks.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 800,
        },
        { signal: controller.signal }
      );
      clearTimeout(timer);
      console.log(`  ✅ Success: ${model}`);
      break;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      lastError = msg;
      console.error(`  ❌ Failed: ${model} — ${msg.slice(0, 80)}`);
    }
  }

  if (!completion) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `All AI models failed. Last error: ${lastError}`
    );
  }

  const rawText = completion.choices[0]?.message?.content ?? "";
  // console.log(`\n📥 Raw AI response (first 300 chars):\n${rawText.slice(0, 300)}\n`);

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJsonFromMessage(rawText);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    console.error("❌ JSON extraction failed:", rawText.slice(0, 500));
    const fallback = slim.slice(0, 3).map((e, i) => ({
      id: e.id,
      title: e.title,
      eventType: e.eventType,
      relevanceScore: 90 - i * 5,
      reason: `This ${e.eventType} event matches your interest in ${payload.interests.join(", ")}.`,
      host: {
        id: "",
        fullName: e.hostName,
        avgRating: e.hostAvgRating,
        reviewCount: e.hostReviewCount,
      },
      location: e.location,
      startDate: e.startDate,
      joiningFee: e.joiningFee,
    }));
    return { suggestedEvents: fallback };
  }

  const suggestions =
    (parsed.suggestedEvents as unknown[]) ??
    (parsed.data as unknown[]) ??
    [];

  return { suggestedEvents: suggestions };
};

const getEventById = async (id: string) => {
  return prisma.event.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          picture: true,
          role: true,
        },
      },
      participants: {
        include: {
          user: {
            select: { id: true, fullName: true, picture: true },
          },
        },
      },
      reviews: true,
      payments: true,
      savedBy: true,
    },
  });
};

const myEvents = async (
  user: IUser,
  filters: any,
  options: IOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  if (user.role === "HOST") {
    andConditions.push({
      hostId: user.id,
    });
  }

  if (user.role === "USER") {
    andConditions.push({
      participants: {
        some: {
          userId: user.id,
        },
      },
    });
  }

  const where: Prisma.EventWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const data = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    include: {
      host: {
        select: {
          id: true,
          fullName: true,
          picture: true,
        },
      },
      participants: true,
    },
  });

  const total = await prisma.event.count({ where });

  return {
    meta: { page, limit, total },
    data,
  };
};

const listEvents = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.EventWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: eventSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: { equals: (filterData as any)[key] },
      })),
    });
  }

  const where: Prisma.EventWhereInput =
    andConditions.length ? { AND: andConditions } : {};

  const data = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      host: { select: { id: true, fullName: true, picture: true } },
      participants: true,
    },
  });

  const total = await prisma.event.count({ where });

  return { meta: { page, limit, total }, data };
};

const deleteEvent = async (id: string) => {
  return prisma.event.delete({ where: { id } });
};

export const EventService = {
  createEvent,
  updateEvent,
  getAISuggestions,
  getEventById,
  myEvents,
  listEvents,
  deleteEvent,
};