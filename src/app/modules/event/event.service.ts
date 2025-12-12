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
import { openai } from "../../helper/open-router";

const createEvent = async (req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = uploadResult?.secure_url;
  }

  const payload = req.body;

  const created = await prisma.event.create({
    data: {
      title: payload.title,
      eventType: payload.eventType ?? null,
      description: payload.description,
      hostId: payload.hostId,
      minParticipants: payload.minParticipants ?? null,
      maxParticipants: payload.maxParticipants ?? null,
      image: payload.image ?? null,
      location: payload.location as any,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
      joiningFee: payload.joiningFee ?? 0,
      status: EventStatus.OPEN,
    },
  });

  return created;
};

const updateEvent = async (eventId: string, req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.image = uploadResult?.secure_url;
  }

  const data: any = { ...req.body };

  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);
  if (data.location) data.location = data.location as any;

  return prisma.event.update({
    where: { id: eventId },
    data,
  });
};
const getAISuggestions = async (payload: { interests: string[] }) => {
  if (!payload?.interests || payload.interests.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Interests are required!");
  }

  // Only fetch useful fields for better AI accuracy
  const events = await prisma.event.findMany({
    where: {
      status: "OPEN", // Only open events
      endDate: { gte: new Date() }, // Not ended
    },
    include: {
      host: {
        include: {
          hostProfile: true,
        },
      },
      participants: true,
      reviews: true,
      savedBy: true,
    },
  });

  console.log("events data loaded.......\n");

  // -------------------------------
  // 🎯 BEST Structured Prompt
  // -------------------------------
  const prompt = `
You are an intelligent event recommendation assistant.
Your job is to recommend the **top 3 most relevant events** for a user based on their interests.

### User interests:
${JSON.stringify(payload.interests, null, 2)}

### Event schema details:
Each event contains:
- eventType: string
- location: { city, address, coordinates }
- status: OPEN | FULL | COMPLETED | CANCELLED
- host with Host status (APPROVED / PENDING)
- participants count
- minParticipants / maxParticipants
- joiningFee
- date range

### IMPORTANT RULES:
1. Only suggest events with:
   - status = OPEN
   - host.status = APPROVED (if host exists)
   - event not FULL (maxParticipants > current participants)
2. Match the eventType or description with interests.
3. Prefer:
   - events in similar locations
   - events with good reviews
   - active hosts (avgRating, reviewCount)
4. Do not suggest irrelevant events.

### Events dataset (JSON):
${JSON.stringify(events, null, 2)}

### OUTPUT FORMAT (STRICT JSON):
{
  "suggestedEvents": [
    {
      "id": "",
      "title": "",
      "eventType": "",
      "relevanceScore": 0-100,
      "reason": "",
      "host": {
        "id": "",
        "fullName": "",
        "avgRating": 0,
        "reviewCount": 0
      },
      "location": {},
      "startDate": "",
      "joiningFee": 0
    }
  ]
}

Return ONLY valid JSON. No explanations, no comments.
`;

  // -------------------------------
  //  AI fallback models
  // -------------------------------
  const models: string[] = [
    "google/gemma-2-27b-it:free",
    "qwen/qwen2.5-14b:free",
    "z-ai/glm-4.5-air:free",
  ];

  let completion = null;

  console.log("Analyzing with fallback models...\n");

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);

      completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a highly accurate and strict JSON-only event recommendation AI.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2, // More accuracy
      });

      break; // success → exit loop
    } catch (error: any) {
      console.error(`Model failed → ${model}`, error.message);
    }
  }

  if (!completion) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "All AI models failed. Please try again later."
    );
  }

  const result = await extractJsonFromMessage(completion.choices[0].message);

  return result;
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
  listEvents,
  deleteEvent,
};