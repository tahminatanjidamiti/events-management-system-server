/* eslint-disable @typescript-eslint/no-unused-vars */
import bcryptjs from "bcryptjs";
import config from "../config";
import { prisma } from "../shared/prisma";
import { Prisma, Role } from "@prisma/client";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findUnique({
      where: { email: config.admin.admin_email },
    });

    if (isAdminExist) {
      return;
    }

    const hashedPassword = await bcryptjs.hash(
      config.admin.admin_email as string,
      Number(config.salt_round)
    );

    const payload: Prisma.UserCreateInput = {
      fullName: "Admin Miller",
      role: Role.ADMIN,
      email: config.admin.admin_email as string,
      password: hashedPassword,
      isVerified: true,
    };

    const admin = await prisma.user.create({ data: payload });
    // console.log("Admin Created Successfully", admin);
  } catch (error) {
    // console.error(error);
  }
};