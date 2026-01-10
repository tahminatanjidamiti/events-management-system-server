import { prisma } from "../../shared/prisma";
import { stripe } from "../../helper/stripe";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";
import httpStatus from "http-status";
import config from "../../config";
import { EventStatus, PaymentStatus } from "@prisma/client";

const createPaymentSession = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
  });

  if (event.joiningFee <= 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This event does not require payment"
    );
  }

  // prevent duplicate join
  const alreadyJoined = await prisma.participant.findFirst({
    where: { userId, eventId },
  });
  if (alreadyJoined) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Already joined this event");
  }

 const transactionId = uuidv4();

const payment = await prisma.payment.create({
  data: {
    amount: event.joiningFee,
    transactionId,
    method: "stripe",
    status: PaymentStatus.UNPAID,
    userId,
    eventId,
  },
});
const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  mode: "payment",
  customer_email: (
    await prisma.user.findUnique({ where: { id: userId } })
  )?.email,
  line_items: [
    {
      price_data: {
        currency: "bdt",
        product_data: { name: event.title },
        unit_amount: Math.round(event.joiningFee * 100),
      },
      quantity: 1,
    },
  ],
  metadata: {
    paymentId: payment.id,
    userId,
    eventId,
  },
  success_url: `${config.frontend_url}/payment-success`,
  cancel_url: `${config.frontend_url}/payment-cancel`,
});

  return { url: session.url, payment };
};


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleStripeCheckoutCompleted = async (session: any) => {
  const { paymentId, userId, eventId } = session.metadata;

  if (!paymentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing paymentId in metadata");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: session,
      },
    });

    await tx.participant.create({
      data: { userId, eventId },
    });

    const count = await tx.participant.count({ where: { eventId } });
    const event = await tx.event.findUnique({ where: { id: eventId } });

    if (event?.maxParticipants && count >= event.maxParticipants) {
      await tx.event.update({
        where: { id: eventId },
        data: { status: EventStatus.FULL },
      });
    }

    await tx.notification.create({
      data: {
        userId,
        title: "Event Joined",
        message: "Your payment was successful and you joined the event.",
      },
    });
  });

  return true;
};
const cancelUnpaidPayments = async () => {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000);

  const unpaid = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.UNPAID,
      createdAt: { lt: cutoff },
    },
  });

  if (!unpaid.length) return;

  await prisma.$transaction(async (tx) => {
    for (const p of unpaid) {
      await tx.payment.update({
        where: { id: p.id },
        data: { status: PaymentStatus.CANCEL },
      });

      await tx.notification.create({
        data: {
          userId: p.userId,
          title: "Payment Cancelled",
          message: "Payment timeout. Please try again.",
        },
      });
    }
  });
};

export const PaymentService = {
  createPaymentSession,
  handleStripeCheckoutCompleted,
  cancelUnpaidPayments,
};