const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const connectdb = require("../Db.js");
const userouter = require("../src/router/Userroute.js");
const bannerouter = require("../src/router/Homebannerroute.js");
const profilerouter = require("../src/router/ProfileRoutes.js");
const itemrouter = require("../src/router/Itemroute.js");
const shoproute = require("../src/router/Shoproute.js");
const navrouter = require("../src/router/NavbarRoute.js");
const campaign = require("../src/router/Campaignroutes.js");
const shoprequest = require("../src/router/ShopRequestRoutes.js");
const categorycreator = require("../src/router/Categorycreatorrouter.js");
const sellerhomebanner = require("../src/router/SellerBannerRoute.js");
const merkovachat = require("../src/router/ChatRoute.js");

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://merkova.vercel.app",
  "https://merkovaa.vercel.app",
];
const allowedOrigins = (
  process.env.CORS_ORIGINS || defaultOrigins.join(",")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: origin not allowed."));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  if (!dbReady) {
    return res.status(503).json({
      status: "degraded",
      message: "Database is not ready",
    });
  }

  return res.status(200).json({ status: "ready" });
});

app.use("/user", userouter);
app.use("/homebanner", bannerouter);
app.use("/sellerhomebanner", sellerhomebanner);
app.use("/api/profile", profilerouter);
app.use("/shop", shoproute);
app.use("/item", itemrouter);
app.use("/nav", navrouter);
app.use("/campaign", campaign);
app.use("/shoprequest", shoprequest);
app.use("/category", categorycreator);
app.use("/chat", merkovachat);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isCorsError =
    typeof err.message === "string" &&
    err.message.includes("CORS policy: origin not allowed.");
  const statusCode = err.status || (isCorsError ? 403 : 500);

  console.error("Request error:", err);
  return res.status(statusCode).json({
    message: isCorsError
      ? "Origin is not allowed by CORS policy"
      : "Internal server error",
  });
});

let server;

const startServer = async () => {
  try {
    await connectdb();
    server = app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = (signal) => {
  console.log(`${signal} received. Starting graceful shutdown...`);

  if (!server) {
    process.exit(0);
  }

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
    } catch (error) {
      console.error("Error while closing MongoDB connection:", error);
    }

    process.exit(0);
  });

  setTimeout(() => {
    console.error("Force shutting down after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

startServer();
