import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocketIO } from "./socket/index.js";
import path from "path";

export const app = express();

// HTTP Server
const httpServer = createServer(app);

// Socketjs Configuration
const io = new Server(httpServer, {
  pingTimeout: 60000,
  // pingInterval: 5000,
  cors: {
    origin:
      process.env.SOCKET_CORS_ORIGIN === "*"
        ? "*"
        : process.env.SOCKET_CORS_ORIGIN.split(","),
    credentials: true,
  },
});

app.set("io", io);

// Middlewares and Configurations

// CORS setup
app.use(
  cors({
    origin:
      process.env.CORS_ORIGIN === "*"
        ? "*"
        : process.env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

// Static Files
app.use(express.static(path.join(process.cwd(), "public")));

// Session Configuration
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

// Passportjs Configuration for OAuth Authentication
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Routes
app.get("/", (req, res) => {
  res.status(200).send("Welcome to Chat_Bot Backend 🚀🚀🔥");
});

// Routers
import userRouter from "./routes/user.routes.js";
import chatRouter from "./routes/chat.routes.js";
import messageRouter from "./routes/message.routes.js";
import ingestRouter from "./routes/ingest.routes.js";

// Socket-io Initialization
initializeSocketIO(io);

// User Route Declaration
app.use("/api/v1/users", userRouter);

// Chat Route Declaration
app.use("/api/v1/chats", chatRouter);

// Message Route Declaration
app.use("/api/v1/messages", messageRouter);

// Ingest Route Declaration
app.use("/api/v1/ingest", ingestRouter);

// Final error handler for unhandled errors in middleware or non-asyncHandler routes
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// For unhandled routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found!",
  });
});

// Exporting HTTP Server

export { httpServer };
