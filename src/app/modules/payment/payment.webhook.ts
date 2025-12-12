import { Request, Response } from "express";
import { stripe } from "../../helper/stripe";
import { PaymentService } from "./payment.service";
import config from "../../config";

export const paymentWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.webhookSecret as string
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await PaymentService.handleStripeCheckoutCompleted(event.data.object);
  }

  res.json({ received: true });
};