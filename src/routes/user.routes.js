import express from "express";
import {
  getCurrentUser,
  handleSocialLogin,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import passport from "passport";
import "../passport/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Unsecured Routes

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

// Secured Routes

router.route("/logout").get(verifyJWT, logoutUser);

router.route("/currentUser").get(verifyJWT, getCurrentUser);

// SSO - ( Single Sign-on ) Routes

router
  .route("/google")
  .get(
    passport.authenticate("google", { scope: ["profile", "email"] }),
    (req, res) => res.send("redirecting to google...")
  );

router
  .route("/google/callback")
  .get(passport.authenticate("google"), handleSocialLogin);

export default router;
