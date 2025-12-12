import { prisma } from "../../shared/prisma";
import { IUser } from "../user/user.interface";
import { PaymentStatus, Role } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../errors/ApiError";

const fetchDashboardMetaData = async (user: IUser) => {
  switch (user.role) {
    case Role.ADMIN:
      return getAdminMetaData();
    case Role.HOST:
      return getHostMetaData(user);
    case Role.USER:
      return getUserMetaData(user);
    default:
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role");
  }
};


const getHostMetaData = async (user: IUser) => {

  const host = await prisma.host.findUnique({ where: { userId: user.id } });
  if (!host) throw new ApiError(httpStatus.NOT_FOUND, "Host profile not found");

  const hostedEvents = await prisma.event.findMany({
    where: { hostId: user.id },
  });

  const upcomingCount = await prisma.event.count({
    where: { hostId: user.id, startDate: { gt: new Date() } },
  });

  const pastCount = await prisma.event.count({
    where: { hostId: user.id, endDate: { lt: new Date() } },
  });

  const participantCount = await prisma.participant.count({
    where: { event: { hostId: user.id } },
  });

  const totalRevenue = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { event: { hostId: user.id }, status: PaymentStatus.PAID },
  });

  const statusGroup = await prisma.event.groupBy({
    by: ["status"],
    _count: { id: true },
    where: { hostId: user.id },
  });

  const formattedStatus = statusGroup.map(({ status, _count }) => ({ status, count: Number(_count.id) }));

  return {
    hostedEventsCount: hostedEvents.length,
    upcomingCount,
    pastCount,
    participantCount,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    eventStatusDistribution: formattedStatus,
  };
};

const getUserMetaData = async (user: IUser) => {
  const userId = user.id;

  const upcoming = await prisma.participant.count({
    where: { userId, event: { startDate: { gt: new Date() } } },
  });

  const past = await prisma.participant.count({
    where: { userId, event: { endDate: { lt: new Date() } } },
  });

  const saved = await prisma.savedEvent.count({ where: { userId } });

  const paymentCount = await prisma.payment.count({ where: { userId, status: PaymentStatus.PAID } });

  return {
    upcomingCount: upcoming,
    pastCount: past,
    savedCount: saved,
    paidPaymentsCount: paymentCount,
  };
};


const getAdminMetaData = async () => {
  const userCount = await prisma.user.count();
  const hostCount = await prisma.host.count();
  const eventCount = await prisma.event.count();
  const participantCount = await prisma.participant.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true }, where: { status: PaymentStatus.PAID } });

  const eventsPerMonth = await prisma.$queryRaw`
    SELECT DATE_TRUNC('month', "createdAt") AS month, CAST(COUNT(*) AS INTEGER) AS count
    FROM "Event"
    GROUP BY month
    ORDER BY month ASC
  `;

  const statusDistribution = await prisma.event.groupBy({ by: ["status"], _count: { id: true } });
  const formattedStatus = statusDistribution.map(({ status, _count }) => ({ status, count: Number(_count.id) }));

  return {
    userCount,
    hostCount,
    eventCount,
    participantCount,
    paymentCount,
    totalRevenue: totalRevenue._sum.amount ?? 0,
    eventsPerMonth,
    eventStatusDistribution: formattedStatus,
  };
};

export const MetaService = {
  fetchDashboardMetaData,
};