import express from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  createOrGetPrivateChat,
  getAllUserChats,
  createChat,
  getChat,
  deleteChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(verifyJWT);

// ++++++++++++++++++++++

router.route("/createChat").post(createChat);

router.route("/getChat/:chatId").get(getChat);

router.route("/getAllUserChats").get(getAllUserChats);

router.route("/deleteChat/:chatId").delete(deleteChat);

export default router;
