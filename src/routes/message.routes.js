import { Router } from "express";
import { guestLimiter, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllMessages,
  sendMessage,
  sendMessageGuest,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Secured Routes

router.route("/getAllMessages/:chatId").get(verifyJWT, getAllMessages);

router.route("/sendMessage/:chatId").post(verifyJWT, sendMessage);

// UnSecured Routes

router.route("/").post(guestLimiter, sendMessageGuest);

export default router;
