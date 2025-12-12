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
exports.PaymentService = void 0;
const prisma_1 = require("../../shared/prisma");
const stripe_1 = require("../../helper/stripe");
const uuid_1 = require("uuid");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../config"));
const client_1 = require("@prisma/client");
const createPaymentSession = (userId, eventId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const event = yield prisma_1.prisma.event.findUniqueOrThrow({
        where: { id: eventId },
    });
    if (event.joiningFee <= 0) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "This event does not require payment");
    }
    // prevent duplicate join
    const alreadyJoined = yield prisma_1.prisma.participant.findFirst({
        where: { userId, eventId },
    });
    if (alreadyJoined) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Already joined this event");
    }
    const transactionId = (0, uuid_1.v4)();
    const session = yield stripe_1.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: (_a = (yield prisma_1.prisma.user.findUnique({ where: { id: userId } }))) === null || _a === void 0 ? void 0 : _a.email,
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
            userId,
            eventId,
            transactionId,
        },
        success_url: `${config_1.default.frontend_url}/payment-success`,
        cancel_url: `${config_1.default.frontend_url}/payment-cancel`,
    });
    const payment = yield prisma_1.prisma.payment.create({
        data: {
            amount: event.joiningFee,
            transactionId,
            method: "stripe",
            status: client_1.PaymentStatus.UNPAID,
            paymentGatewayData: { sessionId: session.id },
            userId,
            eventId,
        },
    });
    return { url: session.url, payment };
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleStripeCheckoutCompleted = (session) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, eventId, transactionId } = session.metadata;
    const payment = yield prisma_1.prisma.payment.findUnique({
        where: { transactionId },
    });
    if (!payment) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Payment not found");
    }
    yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.update({
            where: { id: payment.id },
            data: {
                status: client_1.PaymentStatus.PAID,
                paymentGatewayData: session,
            },
        });
        yield tx.participant.create({
            data: { userId, eventId },
        });
        const count = yield tx.participant.count({ where: { eventId } });
        const event = yield tx.event.findUnique({ where: { id: eventId } });
        if ((event === null || event === void 0 ? void 0 : event.maxParticipants) && count >= event.maxParticipants) {
            yield tx.event.update({
                where: { id: eventId },
                data: { status: client_1.EventStatus.FULL },
            });
        }
        yield tx.notification.create({
            data: {
                userId,
                title: "Event Joined",
                message: "Your payment was successful and you joined the event.",
            },
        });
    }));
    return true;
});
const cancelUnpaidPayments = () => __awaiter(void 0, void 0, void 0, function* () {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const unpaid = yield prisma_1.prisma.payment.findMany({
        where: {
            status: client_1.PaymentStatus.UNPAID,
            createdAt: { lt: cutoff },
        },
    });
    if (!unpaid.length)
        return;
    yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        for (const p of unpaid) {
            yield tx.payment.update({
                where: { id: p.id },
                data: { status: client_1.PaymentStatus.CANCEL },
            });
            yield tx.notification.create({
                data: {
                    userId: p.userId,
                    title: "Payment Cancelled",
                    message: "Payment timeout. Please try again.",
                },
            });
        }
    }));
});
exports.PaymentService = {
    createPaymentSession,
    handleStripeCheckoutCompleted,
    cancelUnpaidPayments,
};
