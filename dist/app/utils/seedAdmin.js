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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const prisma_1 = require("../shared/prisma");
const client_1 = require("@prisma/client");
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAdminExist = yield prisma_1.prisma.user.findUnique({
            where: { email: config_1.default.admin.admin_email },
        });
        if (isAdminExist) {
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(config_1.default.admin.admin_email, Number(config_1.default.salt_round));
        const payload = {
            fullName: "Admin Miller",
            role: client_1.Role.ADMIN,
            email: config_1.default.admin.admin_email,
            password: hashedPassword,
            isVerified: true,
        };
        const admin = yield prisma_1.prisma.user.create({ data: payload });
        // console.log("Admin Created Successfully", admin);
    }
    catch (error) {
        // console.error(error);
    }
});
exports.seedAdmin = seedAdmin;
