import cookie from "cookie";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ChatEventEnum } from "../constants.js";

const mountJoinChatEvent = async (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User joined the chat ✌️. ChatId: ", chatId);

    socket.join(chatId);
  });
};

const mountParticipantTypingEvent = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const initializeSocketIO = async (io) => {
  console.log("Initializing Socket IO...");
  return io.on("connection", async (socket) => {
    console.log("Socket Id: ", socket.id);
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      const token = cookies?.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token)
        throw new ApiError(401, "Unauthorized handshake! Token is missing");

      const decodedToken = await jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET
      );

      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (!user)
        throw new ApiError(401, "Unauthorized handshake! Token is invalid");

      socket.user = user;

      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log("User Connected! UserId: ", user._id.toString());

      mountJoinChatEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);

      socket.on("chatMessage", (data) => {
        console.log("Message:", data);
        socket.emit("server-message", { msg: "Hello from server!" });
      });

      socket.on(ChatEventEnum.DISCONNECTED_EVENT, () => {
        console.log("User has disconnected! UserId: ", user._id.toString());
        if (socket.user?._id) {
          socket.leave(socket.user?._id);
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket"
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
