import { app, httpServer } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// Dotenv Configuration
dotenv.config({
  path: "./env",
});

// MongoDB Connection
connectDB()
  .then(() => {
    httpServer.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running on port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Error: ", err);
  });
