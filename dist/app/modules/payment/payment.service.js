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
const emailSender_1 = __importDefault(require("../../helper/emailSender"));
const buildPaymentSuccessEmail = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Payment Successful</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f9;
      color: #333;
    }
    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      padding: 40px 30px;
      text-align: center;
    }
    .header .checkmark {
      width: 64px;
      height: 64px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      font-size: 32px;
    }
    .header h1 {
      color: #ffffff;
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header p {
      color: rgba(255,255,255,0.85);
      margin-top: 6px;
      font-size: 15px;
    }
    .body {
      padding: 36px 30px;
    }
    .greeting {
      font-size: 16px;
      color: #444;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .info-card {
      background: #f8f7ff;
      border: 1px solid #e0ddff;
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .info-card h2 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #7c3aed;
      margin-bottom: 16px;
      font-weight: 600;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid #edeaff;
      font-size: 14px;
    }
    .info-row:last-child { border-bottom: none; }
    .info-row .label {
      color: #888;
      font-weight: 500;
      min-width: 130px;
    }
    .info-row .value {
      color: #1a1a2e;
      font-weight: 600;
      text-align: right;
    }
    .amount-highlight {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 10px;
      padding: 20px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }
    .amount-highlight .label {
      color: rgba(255,255,255,0.85);
      font-size: 14px;
      font-weight: 500;
    }
    .amount-highlight .value {
      color: #fff;
      font-size: 26px;
      font-weight: 700;
    }
    .note {
      background: #fff8e1;
      border-left: 4px solid #f59e0b;
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 13.5px;
      color: #6b5300;
      margin-bottom: 28px;
      line-height: 1.6;
    }
    .cta {
      text-align: center;
      margin-bottom: 28px;
    }
    .cta a {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.2px;
    }
    .footer {
      background: #f4f6f9;
      padding: 24px 30px;
      text-align: center;
      font-size: 12.5px;
      color: #aaa;
      border-top: 1px solid #e8e8e8;
      line-height: 1.8;
    }
    .footer a { color: #7c3aed; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="checkmark">✅</div>
      <h1>Payment Successful!</h1>
      <p>Your spot has been confirmed</p>
    </div>
 
    <!-- Body -->
    <div class="body">
      <p class="greeting">
        Hi <strong>${data.userName}</strong>, great news! Your payment was processed
        successfully and you're officially registered for the event. Here's a
        summary of your booking:
      </p>
 
      <!-- Amount -->
      <div class="amount-highlight">
        <span class="label">Total Paid</span>
        <span class="value">৳${data.amount.toLocaleString()}</span>
      </div>
 
      <!-- Event Details -->
      <div class="info-card">
        <h2>🎟 Event Details</h2>
        <div class="info-row">
          <span class="label">Event</span>
          <span class="value">${data.eventTitle}</span>
        </div>
        <div class="info-row">
          <span class="label">Date</span>
          <span class="value">${data.eventDate}</span>
        </div>
        <div class="info-row">
          <span class="label">Location</span>
          <span class="value">${data.eventLocation}</span>
        </div>
      </div>
 
      <!-- Transaction Details -->
      <div class="info-card">
        <h2>🧾 Transaction Details</h2>
        <div class="info-row">
          <span class="label">Transaction ID</span>
          <span class="value" style="font-family: monospace; font-size: 12px;">${data.transactionId}</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Method</span>
          <span class="value">Stripe (Card)</span>
        </div>
        <div class="info-row">
          <span class="label">Payment Date</span>
          <span class="value">${data.paymentDate}</span>
        </div>
        <div class="info-row">
          <span class="label">Status</span>
          <span class="value" style="color: #16a34a;">✓ Paid</span>
        </div>
      </div>
 
      <!-- Note -->
      <div class="note">
        📌 Please keep this email as your payment receipt. You may be asked to
        show proof of payment at the event entrance.
      </div>
 
      <!-- CTA -->
      <div class="cta">
        <a href="${config_1.default.frontend_url}/my-events">View My Events</a>
      </div>
    </div>
 
    <!-- Footer -->
    <div class="footer">
      <p>Need help? <a href="mailto:yoursylhetweb@gmail.com">Contact Support</a></p>
      <p style="margin-top: 8px;">
        © ${new Date().getFullYear()} YourApp. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;
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
    const payment = yield prisma_1.prisma.payment.create({
        data: {
            amount: event.joiningFee,
            transactionId,
            method: "stripe",
            status: client_1.PaymentStatus.UNPAID,
            userId,
            eventId,
        },
    });
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
            paymentId: payment.id,
            userId,
            eventId,
        },
        success_url: `${config_1.default.frontend_url}/payment-success?transactionId=${payment.transactionId}&amount=${event.joiningFee}&status=success`,
        cancel_url: `${config_1.default.frontend_url}/payment-cancel?transactionId=${payment.transactionId}&status=cancel`,
    });
    return { url: session.url, payment };
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleStripeCheckoutCompleted = (session) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { paymentId, userId, eventId } = session.metadata;
    if (!paymentId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Missing paymentId in metadata");
    }
    yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.payment.update({
            where: { id: paymentId },
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
        yield tx.savedEvent.create({
            data: { userId, eventId },
        });
        yield tx.notification.create({
            data: {
                userId,
                title: "Event Joined",
                message: "Your payment was successful and you joined the event.",
            },
        });
    }));
    // ── Send confirmation email (outside transaction — non-critical) ──
    try {
        const [user, payment, event] = yield Promise.all([
            prisma_1.prisma.user.findUnique({ where: { id: userId } }),
            prisma_1.prisma.payment.findUnique({ where: { id: paymentId } }),
            prisma_1.prisma.event.findUnique({ where: { id: eventId } }),
        ]);
        if ((user === null || user === void 0 ? void 0 : user.email) && payment && event) {
            const html = buildPaymentSuccessEmail({
                userName: (_a = user.fullName) !== null && _a !== void 0 ? _a : "Participant",
                eventTitle: event.title,
                eventDate: new Date(event.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                eventLocation: (_c = (_b = event.location) === null || _b === void 0 ? void 0 : _b.formattedAddress) !== null && _c !== void 0 ? _c : "TBA",
                transactionId: payment.transactionId,
                amount: payment.amount,
                paymentDate: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            });
            yield (0, emailSender_1.default)(user.email, `✅ Payment Confirmed – ${event.title}`, html);
        }
    }
    catch (emailError) {
        // Log but don't fail the webhook — payment is already confirmed
        // eslint-disable-next-line no-console
        console.error("Failed to send payment confirmation email:", emailError);
    }
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
const getSession = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prisma_1.prisma.payment.findFirst({
        where: { transactionId },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    image: true,
                    startDate: true,
                    location: true,
                    eventType: true,
                },
            },
        },
    });
    return { payment };
});
exports.PaymentService = {
    createPaymentSession,
    handleStripeCheckoutCompleted,
    cancelUnpaidPayments,
    getSession,
};
