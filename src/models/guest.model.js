import mongoose, { Schema } from "mongoose";

const guestSchema = new Schema(
  {
    guestId: {
      type: String,
      required: true,
      unique: true,
    },
    queryCount: {
      type: Number,
      default: 0,
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Guest = mongoose.model("Guest", guestSchema);
