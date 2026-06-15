"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = exports.getAISuggestions = void 0;
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
const prisma_1 = require("../../shared/prisma");
const paginationHelper_1 = require("../../helper/paginationHelper");
const http_status_1 = __importDefault(require("http-status"));
const client_1 = require("@prisma/client");
const event_constant_1 = require("./event.constant");
const fileUploader_1 = require("../../helper/fileUploader");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const extractJsonFromMessage_1 = require("../../helper/extractJsonFromMessage");
const open_router_1 = require("../../helper/open-router");
const createEvent = (user, req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const host = yield prisma_1.prisma.host.findUnique({ where: { userId: user.id } });
    if (!host)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Host profile not found.");
    const hostId = user.id;
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const payload = req.body;
    try {
        const created = yield prisma_1.prisma.event.create({
            data: {
                title: payload.title,
                eventType: (_a = payload.eventType) !== null && _a !== void 0 ? _a : null,
                description: payload.description,
                hostId: hostId,
                minParticipants: (_b = payload.minParticipants) !== null && _b !== void 0 ? _b : null,
                maxParticipants: (_c = payload.maxParticipants) !== null && _c !== void 0 ? _c : null,
                image: (_d = payload.image) !== null && _d !== void 0 ? _d : null,
                location: (_e = payload.location) !== null && _e !== void 0 ? _e : {},
                startDate: new Date(payload.startDate),
                endDate: new Date(payload.endDate),
                joiningFee: (_f = payload.joiningFee) !== null && _f !== void 0 ? _f : 0,
                status: client_1.EventStatus.OPEN,
            },
        });
        return created;
    }
    catch (err) {
        console.error("Prisma error →", err);
        throw err;
    }
});
const updateEvent = (eventId, user, req) => __awaiter(void 0, void 0, void 0, function* () {
    const host = yield prisma_1.prisma.host.findUnique({ where: { userId: user.id } });
    if (!host)
        throw new Error("Host profile not found. Please register as a host first.");
    const hostId = user.id;
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const data = Object.assign({}, req.body);
    if (data.startDate)
        data.startDate = new Date(data.startDate);
    if (data.endDate)
        data.endDate = new Date(data.endDate);
    if (data.location)
        data.location = data.location;
    data.hostId = hostId;
    return prisma_1.prisma.event.update({
        where: { id: eventId },
        data: data,
    });
});
const getAISuggestions = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (!(payload === null || payload === void 0 ? void 0 : payload.interests) || payload.interests.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Interests are required!");
    }
    const rawEvents = yield prisma_1.prisma.event.findMany({
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
        const allOpen = yield prisma_1.prisma.event.findMany({
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
        events = allOpen.filter(e => e.eventType &&
            interestsLower.includes(e.eventType.toLowerCase()));
    }
    const slim = events.map(e => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return ({
            id: e.id,
            title: e.title,
            eventType: (_a = e.eventType) !== null && _a !== void 0 ? _a : "Unknown",
            description: ((_b = e.description) !== null && _b !== void 0 ? _b : "").slice(0, 120),
            location: (() => {
                var _a, _b;
                try {
                    const loc = typeof e.location === "string"
                        ? JSON.parse(e.location)
                        : e.location;
                    return {
                        city: (_b = (_a = loc === null || loc === void 0 ? void 0 : loc.city) !== null && _a !== void 0 ? _a : loc === null || loc === void 0 ? void 0 : loc.formattedAddress) !== null && _b !== void 0 ? _b : "Unknown",
                    };
                }
                catch (_c) {
                    return { city: "Unknown" };
                }
            })(),
            startDate: e.startDate,
            joiningFee: (_c = e.joiningFee) !== null && _c !== void 0 ? _c : 0,
            currentParticipants: e._count.participants,
            maxParticipants: e.maxParticipants,
            hostName: (_e = (_d = e.host) === null || _d === void 0 ? void 0 : _d.fullName) !== null && _e !== void 0 ? _e : "Unknown",
            hostAvgRating: (_g = (_f = e.host) === null || _f === void 0 ? void 0 : _f.avgRating) !== null && _g !== void 0 ? _g : 0,
            hostReviewCount: (_j = (_h = e.host) === null || _h === void 0 ? void 0 : _h.reviewCount) !== null && _j !== void 0 ? _j : 0,
            hostApproved: ((_l = (_k = e.host) === null || _k === void 0 ? void 0 : _k.hostProfile) === null || _l === void 0 ? void 0 : _l.status) === "APPROVED",
        });
    });
    if (slim.length === 0) {
        return { suggestedEvents: [] };
    }
    const prompt = `You are a JSON-only event recommendation API. You MUST respond with ONLY valid JSON - no explanations, no markdown, no code fences, no text before or after.
 
User interests: ${JSON.stringify(payload.interests)}
 
Available OPEN events: ${JSON.stringify(slim)}
 
Task: Pick the top ${Math.min(3, slim.length)} most relevant events matching the user's interests.
 
RESPOND WITH EXACTLY THIS JSON STRUCTURE AND NOTHING ELSE:
{"suggestedEvents":[{"id":"","title":"","eventType":"","relevanceScore":85,"reason":"2-sentence explanation why this matches the user interests","host":{"id":"","fullName":"","avgRating":0,"reviewCount":0},"location":{"city":""},"startDate":"","joiningFee":0}]}`;
    const models = yield (0, open_router_1.getFreeFallbackModels)();
    let completion = null;
    let lastError = "";
    console.log(`\n🎯 AI matching ${slim.length} events for interests: ${payload.interests.join(", ")}`);
    for (const model of models) {
        try {
            console.log(`  Trying: ${model}`);
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 55000);
            completion = yield open_router_1.openai.chat.completions.create({
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
            }, { signal: controller.signal });
            clearTimeout(timer);
            console.log(`  ✅ Success: ${model}`);
            break;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            lastError = msg;
            console.error(`  ❌ Failed: ${model} — ${msg.slice(0, 80)}`);
        }
    }
    if (!completion) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, `All AI models failed. Last error: ${lastError}`);
    }
    const rawText = (_c = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) !== null && _c !== void 0 ? _c : "";
    // console.log(`\n📥 Raw AI response (first 300 chars):\n${rawText.slice(0, 300)}\n`);
    let parsed;
    try {
        parsed = (0, extractJsonFromMessage_1.extractJsonFromMessage)(rawText);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (e) {
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
    const suggestions = (_e = (_d = parsed.suggestedEvents) !== null && _d !== void 0 ? _d : parsed.data) !== null && _e !== void 0 ? _e : [];
    return { suggestedEvents: suggestions };
});
exports.getAISuggestions = getAISuggestions;
const getEventById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.event.findUnique({
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
});
const myEvents = (user, filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: event_constant_1.eventSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: { equals: filterData[key] },
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
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.event.findMany({
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
    const total = yield prisma_1.prisma.event.count({ where });
    return {
        meta: { page, limit, total },
        data,
    };
});
const listEvents = (filters, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = filters, filterData = __rest(filters, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: event_constant_1.eventSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: { equals: filterData[key] },
            })),
        });
    }
    const where = andConditions.length ? { AND: andConditions } : {};
    const data = yield prisma_1.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
            host: { select: { id: true, fullName: true, picture: true } },
            participants: true,
        },
    });
    const total = yield prisma_1.prisma.event.count({ where });
    return { meta: { page, limit, total }, data };
});
const deleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.event.delete({ where: { id } });
});
exports.EventService = {
    createEvent,
    updateEvent,
    getAISuggestions: exports.getAISuggestions,
    getEventById,
    myEvents,
    listEvents,
    deleteEvent,
};
