import bcryptjs from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Prisma, UserStatus } from "@prisma/client";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import { jwtHelper } from "../../helper/jwtHelper";
import { Secret } from "jsonwebtoken";
import httpStatus from "http-status"
import emailSender from "../../helper/emailSender";

const loginWithEmailAndPassword = async ({ email, password }: { email: string, password: string }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new Error("User not found!");

    const isPasswordMatched = await bcryptjs.compare(password, user.password as string);
    if (!isPasswordMatched) throw new Error("Password does not match!");
    const accessToken = jwtHelper.generateToken({ id: user.id, email: user.email, role: user.role }, config.jwt.jwt_secret as Secret, config.jwt.expires_in as string);

    const refreshToken = jwtHelper.generateToken({id: user.id, email: user.email, role: user.role }, config.jwt.refresh_token_secret as Secret, config.jwt.refresh_token_expires_in as string);
    return {
        accessToken,
        refreshToken,
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        phone: user.phone ?? null,
        picture: user.picture ?? null,
        status: user.status,
        isVerified: user.isVerified,
        bio: user.bio ?? null,
        city: user.city ?? null,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
    };
};

const authWithGoogle = async (data: Prisma.UserCreateInput) => {
    let user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })

    if (!user) {
        user = await prisma.user.create({
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
        phone: user.phone ?? null,
        picture: user.picture ?? null,
        status: user.status,
        isVerified: user.isVerified,
        bio: user.bio ?? null,
        city: user.city ?? null,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
    };
}

const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelper.verifyToken(token, config.jwt.refresh_token_secret as Secret);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });

    const accessToken = jwtHelper.generateToken({
        id: userData.id,
        email: userData.email,
        role: userData.role
    },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );

    return {
        accessToken
    };

};
const forgotPassword = async (payload: { email: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: UserStatus.ACTIVE
        }
    });

    const resetPassToken = jwtHelper.generateToken(
        { id: userData.id, email: userData.email, role: userData.role },
        config.jwt.reset_pass_secret as Secret,
        config.jwt.reset_pass_token_expires_in as string
    )

    const resetPassLink = config.reset_pass_link + `?userId=${userData.id}&token=${resetPassToken}`

    await emailSender(
        userData.email,
        "Reset Password Link",
        `
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
        `
    )
};

const resetPassword = async (token: string, payload: { id: string, password: string }) => {

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id: payload.id,
            status: UserStatus.ACTIVE
        }
    });

    const isValidToken = jwtHelper.verifyToken(token, config.jwt.reset_pass_secret as Secret)

    if (!isValidToken) {
        throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!")
    }
    const password = await bcryptjs.hash(payload.password, Number(config.salt_round));

    await prisma.user.update({
        where: {
            id: payload.id
        },
        data: {
            password
        }
    })
};


export const AuthService = {
    loginWithEmailAndPassword,
    authWithGoogle,
    refreshToken,
    forgotPassword,
    resetPassword,
}