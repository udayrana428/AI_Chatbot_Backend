import axios from "axios";
import { PromptEmbedding } from "../models/promptEmbedding.model.js";

const getEmbedding = async (text) => {
  const response = await axios.post(
    "https://api.openai.com/v1/embeddings",
    {
      input: text,
      model: "text-embedding-3-small",
    },
    {
      headers: {
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
      },
    }
  );

  return response.data.data[0].embedding; // returns a float[] array
};

const calculateCosineSimilarity = (vec1, vec2) => {
  if (!vec1 || !vec2 || vec1.length !== vec2.length) return 0;

  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  if (norm1 === 0 || norm2 === 0) return 0;

  return dot / (norm1 * norm2);
};

export { getEmbedding, calculateCosineSimilarity };
