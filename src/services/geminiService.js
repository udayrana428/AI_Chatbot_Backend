import { GoogleGenAI } from "@google/genai";
import { calculateCosineSimilarity, getEmbedding } from "../utils/embedding.js";
import { PromptEmbedding } from "../models/promptEmbedding.model.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Load model instance once
// const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

// Function to get response from Embedding search
const generateGeminiResponse = async (query) => {
  const queryEmbedding = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: query,
    config: { outputDimensionality: 10 },
  }); // Your vectorization logic here

  console.log("QueryEmbedding: ", queryEmbedding);

  // Perform similarity search on stored embeddings in MongoDB
  const embeddings = await PromptEmbedding.find();

  // Search for the most similar embedding (you can use cosine similarity)
  let bestMatch = null;
  let highestSimilarity = -1;

  for (const embeddingDoc of embeddings) {
    const similarity = calculateCosineSimilarity(
      queryEmbedding,
      embeddingDoc.embedding
    );
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = embeddingDoc;
    }
  }

  if (bestMatch && highestSimilarity > 0.8) {
    // Return the content from the best match if similarity is above a threshold
    return bestMatch.content;
  } else {
    // Fallback to Google Gemini if no relevant match is found
    return getFallbackResponse(query);
  }
};

// Function to get a fallback response from Google Gemini
const getFallbackResponse = async (query) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `User question: ${query} (In the context of Real World Assets (RWA))`,
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: `You are an assistant that ONLY answers questions related to Real World Assets (RWA). If the question is unrelated to RWA, simply reply: "I'm sorry, I don't have the information you're looking for."`,
          },
        ],
      },
    });
    console.log(response.text);
    return response.text;
  } catch (error) {
    console.error("Error querying Google Gemini:", error);
    return "Sorry, I wasn't able to find relevant information on that topic.";
  }
};

export { generateGeminiResponse };
