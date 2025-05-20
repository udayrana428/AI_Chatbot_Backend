import { Router } from "express";
import { verifyJWT, verifyPermission } from "../middlewares/auth.middleware.js";
import {
  ingestSingleFromDocument,
  ingestSinglePageFromWeb,
} from "../controllers/ingest.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/web/single")
  .post(verifyPermission(["ADMIN"]), ingestSinglePageFromWeb);

router
  .route("/doc/single")
  .post(
    verifyPermission(["ADMIN"]),
    upload.single("file"),
    ingestSingleFromDocument
  );

export default router;
