import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateGeminiResponse } from "../services/geminiService.js";

const chatMessageCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        sender: { $first: "$sender" },
      },
    },
  ];
};

const getAllMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) throw new ApiError(400, "chatId is required");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ObjectID format" });
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) throw new ApiError(404, "Chat does not exist");

  const messages = await Message.aggregate([
    {
      $match: {
        chatId: new mongoose.Types.ObjectId(chatId),
      },
    },
    // ...chatMessageCommonAggregation(),
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  if (!messages) throw new ApiError(500, "Internal server error");

  return res
    .status(200)
    .json(
      new ApiResponse(200, messages || [], "Messages fetched successfully")
    );
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { query } = req.body;

  if (!query) throw new ApiError(400, "Message query is required");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ObjectID format" });
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) throw new ApiError(404, "Chat does not exist");

  const message = await Message.create({
    content: query || "",
    chatId: new mongoose.Types.ObjectId(chatId),
    role: "user",
  });

  const geminiResponse = await generateGeminiResponse(query);

  const receivedMessage = await Message.create({
    chatId: new mongoose.Types.ObjectId(),
    content: geminiResponse,
    role: "assistant",
  });

  if (!receivedMessage) throw new ApiError(500, "Internal server error");

  return res
    .status(201)
    .json(new ApiResponse(201, receivedMessage, "Message saved successfully"));
});

export { getAllMessages, sendMessage };
