import mongoose, { Schema } from "mongoose";

const promptEmbeddingSchema = new Schema(
  {
    source: {
      type: String,
      required: true,
    },
    embeddings: {
      type: [Number],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const PromptEmbedding = mongoose.model(
  "PromptEmbedding",
  promptEmbeddingSchema
);
