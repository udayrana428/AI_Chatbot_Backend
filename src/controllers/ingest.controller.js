import { PromptEmbedding } from "../models/promptEmbedding.model.js";
import { generateEmbedding } from "../services/geminiService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// import { getEmbedding } from "../utils/embedding.js";
import { scrapeTextFromFile, scrapeTextFromWeb } from "../utils/scrapeText.js";

const ingestSinglePageFromWeb = asyncHandler(async (req, res) => {
  const { pageUrl } = req.body;

  if (!pageUrl) throw new ApiError(400, "Page url is required");

  const { bodyText: scrapedText } = await scrapeTextFromWeb(pageUrl);

  const embeddings = await generateEmbedding(scrapedText);

  const ingested = await PromptEmbedding.create({
    source: pageUrl,
    embeddings,
    content: scrapedText,
  });

  if (!ingested) throw new ApiError(500, "Internal server error");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { source: ingested.source, content: ingested.content },
        "Web page ingested successfully"
      )
    );
});

const ingestSingleFromDocument = asyncHandler(async (req, res) => {
  if (!req.file?.filename)
    throw new ApiError(400, "File is required for ingesting");

  const fileLocalPath = `public/temp/${req.file.filename}`;

  const scrapedText = await scrapeTextFromFile(fileLocalPath);

  console.log(scrapedText);
});

export { ingestSinglePageFromWeb, ingestSingleFromDocument };
