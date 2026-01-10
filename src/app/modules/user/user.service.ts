/* eslint-disable @typescript-eslint/no-explicit-any */
import { IUser } from "./user.interface";
import { Prisma, Role, UserStatus } from "@prisma/client";
import { userSearchableFields } from "./user.constant";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import bcryptjs from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { fileUploader } from "../../helper/fileUploader";
import config from "../../config";
import httpStatus from "http-status";
import { Request } from "express";
import ApiError from "../../errors/ApiError";

const createUser = async (req: Request) => {
  const { email } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Email already exists"
    );
  }
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.picture = uploadResult?.secure_url;
  }

  const hashedPassword = await bcryptjs.hash(
    req.body.password,
    Number(config.salt_round)
  );
  const data = {
    ...req.body,
    password: hashedPassword,
  };

  const result = await prisma.user.create({ data });

  return result;
};

const getAllUsers = async (params: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);

  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
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

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    skip,
    take: limit,
    where: whereConditions,
    orderBy: { [sortBy]: sortOrder },
  });

  const total = await prisma.user.count({ where: whereConditions });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getUserById = async (id: string) => {
  return prisma.user.findUnique({
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
};
const getMyProfile = async (user: IUser) => {
  const userInfo = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE
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
  })

  let profileData;

  if (userInfo.role === Role.USER) {
    profileData = await prisma.user.findUnique({
      where: {
        email: userInfo.email
      }
    })
  }
  else if (userInfo.role === Role.HOST) {
    profileData = await prisma.user.findUnique({
      where: {
        email: userInfo.email
      }
    })
  }
  else if (userInfo.role === Role.ADMIN) {
    profileData = await prisma.user.findUnique({
      where: {
        email: userInfo.email
      }
    })
  }

  return {
    ...userInfo,
    ...profileData
  };

};

const updateUser = async (id: string, req: Request) => {
  if (req.file) {
    const uploadResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.picture = uploadResult?.secure_url;
  }

  const dataToUpdate: any = { ...req.body };

  if (req.body.password) {
    dataToUpdate.password = await bcryptjs.hash(
      req.body.password,
      Number(config.salt_round)
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  return updatedUser;
};

const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
  });
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  getMyProfile,
  updateUser,
  deleteUser,
};
