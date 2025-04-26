import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      default: "gemini-1.5-pro",
    },
    contextChunks: [
      {
        type: Schema.Types.ObjectId,
        ref: "PromptEmbedding",
      },
    ],
    // attachements: {
    //   type: [
    //     {
    //       type: String,
    //     },
    //   ],
    //   default: [],
    // },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", MessageSchema);
