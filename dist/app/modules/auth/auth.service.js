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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../shared/prisma");
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const jwtHelper_1 = require("../../helper/jwtHelper");
const http_status_1 = __importDefault(require("http-status"));
const emailSender_1 = __importDefault(require("../../helper/emailSender"));
const loginWithEmailAndPassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    var _b, _c, _d, _e;
    const user = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user)
        throw new Error("User not found!");
    const isPasswordMatched = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordMatched)
        throw new Error("Password does not match!");
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        phone: (_b = user.phone) !== null && _b !== void 0 ? _b : null,
        picture: (_c = user.picture) !== null && _c !== void 0 ? _c : null,
        status: user.status,
        isVerified: user.isVerified,
        bio: (_d = user.bio) !== null && _d !== void 0 ? _d : null,
        city: (_e = user.city) !== null && _e !== void 0 ? _e : null,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
    };
});
const authWithGoogle = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let user = yield prisma_1.prisma.user.findUnique({
        where: {
            email: data.email
        }
    });
    if (!user) {
        user = yield prisma_1.prisma.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                picture: data.picture,
            }
        });
    }
    return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        phone: (_a = user.phone) !== null && _a !== void 0 ? _a : null,
        picture: (_b = user.picture) !== null && _b !== void 0 ? _b : null,
        status: user.status,
        isVerified: user.isVerified,
        bio: (_c = user.bio) !== null && _c !== void 0 ? _c : null,
        city: (_d = user.city) !== null && _d !== void 0 ? _d : null,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
    };
});
const forgotPassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVE
        }
    });
    const resetPassToken = jwtHelper_1.jwtHelper.generateToken({ email: userData.email, role: userData.role }, config_1.default.jwt.reset_pass_secret, config_1.default.jwt.reset_pass_token_expires_in);
    const resetPassLink = config_1.default.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`;
    yield (0, emailSender_1.default)(userData.email, "Reset Password Link", `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>

        </div>
        `);
});
const resetPassword = (token, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userData = yield prisma_1.prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: client_1.UserStatus.ACTIVE
        }
    });
    const isValidToken = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.reset_pass_secret);
    if (!isValidToken) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Forbidden!");
    }
    const password = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.salt_round));
    yield prisma_1.prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    });
});
exports.AuthService = {
    loginWithEmailAndPassword,
    authWithGoogle,
    forgotPassword,
    resetPassword,
};
