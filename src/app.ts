import compression from "compression";
import cors from "cors";
import express from "express";
import config from "./app/config";

const app = express();

// Middleware
app.use(cors()); 
app.use(compression()); // Compresses response bodies for faster delivery
app.use(express.json());

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

export default app;
