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
exports.EventService = void 0;
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
const createEvent = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.image = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const payload = req.body;
    const created = yield prisma_1.prisma.event.create({
        data: {
            title: payload.title,
            eventType: (_a = payload.eventType) !== null && _a !== void 0 ? _a : null,
            description: payload.description,
            hostId: payload.hostId,
            minParticipants: (_b = payload.minParticipants) !== null && _b !== void 0 ? _b : null,
            maxParticipants: (_c = payload.maxParticipants) !== null && _c !== void 0 ? _c : null,
            image: (_d = payload.image) !== null && _d !== void 0 ? _d : null,
            location: payload.location,
            startDate: new Date(payload.startDate),
            endDate: new Date(payload.endDate),
            joiningFee: (_e = payload.joiningFee) !== null && _e !== void 0 ? _e : 0,
            status: client_1.EventStatus.OPEN,
        },
    });
    return created;
});
const updateEvent = (eventId, req) => __awaiter(void 0, void 0, void 0, function* () {
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
    return prisma_1.prisma.event.update({
        where: { id: eventId },
        data: data,
    });
});
const getAISuggestions = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(payload === null || payload === void 0 ? void 0 : payload.interests) || payload.interests.length === 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Interests are required!");
    }
    // Only fetch useful fields for better AI accuracy
    const events = yield prisma_1.prisma.event.findMany({
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
    const models = [
        "google/gemma-2-27b-it:free",
        "qwen/qwen2.5-14b:free",
        "z-ai/glm-4.5-air:free",
    ];
    let completion = null;
    console.log("Analyzing with fallback models...\n");
    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            completion = yield open_router_1.openai.chat.completions.create({
                model,
                messages: [
                    {
                        role: "system",
                        content: "You are a highly accurate and strict JSON-only event recommendation AI.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                temperature: 0.2, // More accuracy
            });
            break; // success → exit loop
        }
        catch (error) {
            console.error(`Model failed → ${model}`, error.message);
        }
    }
    if (!completion) {
        throw new ApiError_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "All AI models failed. Please try again later.");
    }
    const result = yield (0, extractJsonFromMessage_1.extractJsonFromMessage)(completion.choices[0].message);
    return result;
});
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
    getAISuggestions,
    getEventById,
    myEvents,
    listEvents,
    deleteEvent,
};
