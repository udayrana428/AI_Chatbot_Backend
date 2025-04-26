import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllMessages,
  sendMessage,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/getAllMessages/:chatId").get(getAllMessages);

router.route("/sendMessage/:chatId").post(sendMessage);

export default router;
