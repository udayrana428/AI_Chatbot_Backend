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

const storeEmbedding = async (text, userId = null, source = "chat") => {
  const vector = await getEmbedding(text);

  const doc = new PromptEmbedding({
    userId,
    content: text,
    embedding: vector,
    source,
  });

  await doc.save();
};

const calculateCosineSimilarity = (vec1, vec2) => {
  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const norm1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const norm2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
  return dot / (norm1 * norm2);
};

const findRelevantContent = async (query) => {
  const queryEmbedding = await getEmbedding(query);
  const all = await PromptEmbedding.find({});

  const scored = all.map((doc) => ({
    doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.doc.content); // top 3
};

export { getEmbedding, calculateCosineSimilarity };
