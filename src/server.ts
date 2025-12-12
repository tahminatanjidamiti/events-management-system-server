/* eslint-disable no-console */
import http, { Server } from "http";
import app from "./app";
import dotenv from "dotenv";
import { seedAdmin } from "./app/utils/seedAdmin";

dotenv.config();

let server: Server | null = null;
async function connectToDB() {
  try {
    console.log("*** DB connection successfull!!")
  } catch (error) {
    console.log("*** DB connection failed!", error)
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectToDB()
    server = http.createServer(app);
    server.listen(process.env.PORT, () => {
      console.log(`🚀 Server is running on port ${process.env.PORT}`);
    });

    handleProcessEvents();
  } catch (error) {
    console.error("❌ Error during server startup:", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.warn(`🔄 Received ${signal}, shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("✅ HTTP server closed.");

      try {
        console.log("Server shutdown complete.");
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
      }

      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

function handleProcessEvents() {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
    gracefulShutdown("unhandledRejection");
  });
}

(async () => {
   await startServer()
   await seedAdmin()
})()
