import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      toLowerCase: true,
      trim: true,
      default: "untitled chat",
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ userId: 1 });
chatSchema.index({ updatedAt: -1 });

export const Chat = mongoose.model("Chat", chatSchema);
