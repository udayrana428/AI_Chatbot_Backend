import { GoogleGenAI } from "@google/genai";
import { calculateCosineSimilarity } from "../utils/embedding.js";
import { PromptEmbedding } from "../models/promptEmbedding.model.js";
import { marked } from "marked";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Load model instance once
// const model = ai.getGenerativeModel({ model: "gemini-1.5-pro" });

// Function to get response from Embedding search
const generateGeminiResponse = async (query) => {
  const queryEmbedding = await generateEmbedding(query);

  // console.log("QueryEmbedding: ", queryEmbedding);

  // Perform similarity search on stored embeddings in MongoDB
  const embeddings = await PromptEmbedding.find();

  // Search for the most similar embedding (you can use cosine similarity)
  let bestMatch = null;
  let highestSimilarity = -1;

  for (const embeddingDoc of embeddings) {
    const similarity = calculateCosineSimilarity(
      queryEmbedding,
      embeddingDoc.embeddings
    );
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = embeddingDoc;
    }
  }

  if (bestMatch && highestSimilarity > 0.65) {
    // Return the content from the best match if similarity is above a threshold
    return bestMatch.content;
  } else {
    // Fallback to Google Gemini if no relevant match is found
    return getFallbackResponse(query);
    // return;
  }
};

// Function to get a fallback response from Google Gemini
const getFallbackResponse = async (query) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `User question: ${query}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `You are an assistant that specializes in Real World Assets (RWA). 
        If the question is clearly unrelated to RWA (like sports, cooking, movies, etc.), politely decline.
        Otherwise, if it could be even *loosely connected* (such as DeFi, tokenization, finance), provide helpful and accurate information.
        `,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error querying Google Gemini:", error);
    // return "Sorry, I wasn't able to find relevant information on that topic.";
    throw new Error("Error querying Google Gemini");
  }
};

const generateEmbedding = async (text) => {
  const response = await ai.models.embedContent({
    model: "text-embedding-004",
    contents: text,
    config: { outputDimensionality: 10 },
  });
  // console.log("Embedding: ", response);
  return response.embeddings[0].values;
};

export { generateGeminiResponse, generateEmbedding };
