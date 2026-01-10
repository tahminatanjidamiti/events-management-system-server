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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const user_constant_1 = require("./user.constant");
const paginationHelper_1 = require("../../helper/paginationHelper");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../shared/prisma");
const fileUploader_1 = require("../../helper/fileUploader");
const config_1 = __importDefault(require("../../config"));
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createUser = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const existingUser = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "Email already exists");
    }
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.picture = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, Number(config_1.default.salt_round));
    const data = Object.assign(Object.assign({}, req.body), { password: hashedPassword });
    const result = yield prisma_1.prisma.user.create({ data });
    return result;
});
const getAllUsers = (params, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(options);
    const { searchTerm } = params, filterData = __rest(params, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: user_constant_1.userSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map((key) => ({
                [key]: {
                    equals: filterData[key],
                },
            })),
        });
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const result = yield prisma_1.prisma.user.findMany({
        skip,
        take: limit,
        where: whereConditions,
        orderBy: { [sortBy]: sortOrder },
    });
    const total = yield prisma_1.prisma.user.count({ where: whereConditions });
    return {
        meta: { page, limit, total },
        data: result,
    };
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            interests: true,
            phone: true,
            picture: true,
            status: true,
            isVerified: true,
            bio: true,
            city: true,
            avgRating: true,
            reviewCount: true,
            followers: true,
            following: true,
            hostProfile: true,
        }
    });
});
const getMyProfile = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const userInfo = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: client_1.UserStatus.ACTIVE
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            interests: true,
            phone: true,
            picture: true,
            status: true,
            isVerified: true,
            bio: true,
            city: true,
            avgRating: true,
            reviewCount: true,
        }
    });
    let profileData;
    if (userInfo.role === client_1.Role.USER) {
        profileData = yield prisma_1.prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        });
    }
    else if (userInfo.role === client_1.Role.HOST) {
        profileData = yield prisma_1.prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        });
    }
    else if (userInfo.role === client_1.Role.ADMIN) {
        profileData = yield prisma_1.prisma.user.findUnique({
            where: {
                email: userInfo.email
            }
        });
    }
    return Object.assign(Object.assign({}, userInfo), profileData);
});
const updateUser = (id, req) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.file) {
        const uploadResult = yield fileUploader_1.fileUploader.uploadToCloudinary(req.file);
        req.body.picture = uploadResult === null || uploadResult === void 0 ? void 0 : uploadResult.secure_url;
    }
    const dataToUpdate = Object.assign({}, req.body);
    if (req.body.password) {
        dataToUpdate.password = yield bcryptjs_1.default.hash(req.body.password, Number(config_1.default.salt_round));
    }
    const updatedUser = yield prisma_1.prisma.user.update({
        where: { id },
        data: dataToUpdate,
    });
    return updatedUser;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.user.delete({
        where: { id },
    });
});
exports.UserService = {
    createUser,
    getAllUsers,
    getUserById,
    getMyProfile,
    updateUser,
    deleteUser,
};
