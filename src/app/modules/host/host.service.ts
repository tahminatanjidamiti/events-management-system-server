import { prisma } from "../../shared/prisma";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import { HostUpdateStatus, Role } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const requestToBecomeHost = async (id: string, payload: any) => {
  
  const existing = await prisma.host.findUnique({
    where: { id },
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Host request already exists");
  }

  return prisma.host.create({
    data: {
      userId: id,
      message: payload.message,
    },
  });
};
const updateHost = async (id: string, req: Request) => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataToUpdate: any = { ...req.body };

  const updatedHost = await prisma.host.update({
    where: { id },
    data: dataToUpdate,
  });

  return updatedHost;
};

const approveHost = async (hostId: string) => {
  return prisma.$transaction(async (tx) => {
    const host = await tx.host.update({
      where: { id: hostId },
      data: {
        status: HostUpdateStatus.APPROVED,
        reviewedAt: new Date(),
      },
      include: { user: true },
    });

    await tx.user.update({
      where: { id: host.userId },
      data: { role: Role.HOST },
    });

    return host;
  });
};

const getAllHosts = async () => {
  return prisma.host.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          picture: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};


export const HostService = {
  requestToBecomeHost,
  updateHost,
  approveHost,
  getAllHosts,
};