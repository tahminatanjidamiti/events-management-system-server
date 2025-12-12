import compression from "compression";
import cors from "cors";
import cookieParser from 'cookie-parser'
import express, { Application } from "express";
import cron from 'node-cron';
import config from "./app/config";
import { PaymentService } from "./app/modules/payment/payment.service";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { paymentWebhookHandler } from "./app/modules/payment/payment.webhook";
import router from "./app/routes";


const app: Application = express();
app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    paymentWebhookHandler
);
// Middleware
app.use(cors()); 
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
cron.schedule('* * * * *', () => {
    try {
      // console.log("Node cron called at ", new Date())
       PaymentService.cancelUnpaidPayments();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }
});

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);

app.use("/api/v1", router);
app.get("/", (_req, res) => {
  res.send("API is running!!");
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
