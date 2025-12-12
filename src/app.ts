import compression from "compression";
import cors from "cors";
import cookieParser from 'cookie-parser'
import express, { Application } from "express";
import config from "./app/config";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";


const app: Application = express();

// Middleware
app.use(cors()); 
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);


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
