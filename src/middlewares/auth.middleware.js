import { Guest } from "../models/guest.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized request");

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(404, "Invalid access token");

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const avoidInProduction = asyncHandler(async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    next();
  } else {
    throw new ApiError(
      403,
      "This service is only available in local environment"
    );
  }
});

export const guestLimiter = async (req, res, next) => {
  try {
    if (req.user) {
      return next(); // Logged in users -> skip
    }

    const guestId = req.ip; // (or you can generate token and store in client cookie for better tracking)

    let guest = await Guest.findOne({ guestId });

    if (!guest) {
      guest = await Guest.create({ guestId, queryCount: 0 });
    }

    const now = new Date();
    const lastReset = guest.lastReset || now;
    const isSameDay = now.toDateString() === lastReset.toDateString();

    if (!isSameDay) {
      guest.queryCount = 0;
      guest.lastReset = now;
    }

    if (guest.queryCount >= 20) {
      return res.status(429).json({
        success: false,
        message:
          "Daily guest query limit reached. Please sign up for unlimited access!",
      });
    }

    guest.queryCount += 1;
    await guest.save();

    next(); // allow the request to continue
  } catch (error) {
    console.error("Guest limiter error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while checking guest limits.",
    });
  }
};
