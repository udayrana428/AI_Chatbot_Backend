import { User } from "../models/user.model.js";
import { Chat } from "../models/chat.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { emitSocketEvent } from "../socket/index.js";
import { ChatEventEnum } from "../constants.js";

const chatCommonAggregation = () => {
  return [
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        as: "participants",
        pipeline: [
          {
            $project: {
              password: 0,
              refreshToken: 0,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        localField: "lastMessage",
        foreignField: "_id",
        as: "lastMessage",
        pipeline: [
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
        ],
      },
    },
    {
      $addFields: {
        lastMessage: { $first: "$lastMessage" },
      },
    },
  ];
};

const createOrGetPrivateChat = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  const receiver = await User.findById(receiverId);

  if (!receiver) throw new ApiError(404, "Receiver does not exist");

  if (req.user._id.toString() === receiver._id.toString())
    throw new ApiError(400, "You cannot chat with yourself");

  const chat = await Chat.aggregate([
    {
      $match: {
        isGroupChat: false,
        $and: [
          { participants: { $elemMatch: { $eq: req.user_id } } },
          {
            participants: {
              $elemMatch: {
                $eq: new mongoose.Types.ObjectId(receiverId),
              },
            },
          },
        ],
      },
    },
    ...chatCommonAggregation(),
  ]);

  if (chat.length) {
    return res
      .status(200)
      .json(new ApiResponse(200, chat[0], "Chat retrieved successfully"));
  }

  const newChatInstance = await Chat.create({
    name: "private",
    participants: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
    admins: [req.user._id, new mongoose.Types.ObjectId(receiverId)],
  });

  const createdChat = await Chat.aggregate([
    {
      $match: { _id: newChatInstance._id },
    },
    ...chatCommonAggregation(),
  ]);

  const payload = createdChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  payload?.participants?.forEach((participant) => {
    if (participant._id.toString() === req.user._id.toString()) return;

    emitSocketEvent(
      req,
      participant._id?.toString(),
      ChatEventEnum.NEW_CHAT_EVENT,
      payload
    );
  });

  return res
    .status(201)
    .json(new ApiResponse(201, payload, "Chat retrieved successfully"));
});

const createChat = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const newChatInstance = await Chat.create({
    userId: req.user._id,
    title,
  });

  if (!newChatInstance) throw new ApiError(500, "Failed to create new chat");

  const createdChat = await Chat.aggregate([
    {
      $match: {
        _id: newChatInstance._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              email: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        userId: 0,
      },
    },
  ]);

  const payload = createdChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  return res
    .status(201)
    .json(new ApiResponse(201, payload || [], "Chat created successfully"));
});

const getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) throw new ApiError(400, "chatId is required");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ObjectID format" });
  }

  const selectedChat = await Chat.findById(chatId);

  if (!selectedChat) throw new ApiError(404, "Chat does not exist");

  const aggregatedChat = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
        pipeline: [
          {
            $project: {
              email: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        user: {
          $first: "$user",
        },
      },
    },
  ]);

  const payload = aggregatedChat[0];

  if (!payload) throw new ApiError(500, "Internal server error");

  return res
    .status(200)
    .json(new ApiResponse(200, payload || [], "Chat retrieved successfully"));
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!chatId) throw new ApiError(400, "chatId is required");

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid ObjectID format" });
  }

  const selectedChat = await Chat.findByIdAndDelete(chatId);

  if (!selectedChat) throw new ApiError(404, "Chat does not exist");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully"));
});

const getAllUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        userId: req.user._id,
      },
    },
    {
      $sort: {
        updatedAt: -1,
      },
    },
    {
      $project: {
        userId: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, chats || [], "User's all chats fetched successfully")
    );
});

export {
  createOrGetPrivateChat,
  getAllUserChats,
  createChat,
  getChat,
  deleteChat,
};
