import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { userProfileController } from "../controllers/auth/userProfile.controller";
import upload from "../config/multer";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  userProfileController.getUserProfile.bind(userProfileController)
);

router.put(
  "/:userId",
  requireAuth,
  userProfileController.updateUserProfile.bind(userProfileController)
);

router.put(
  "/profile/:userId/cv",
  requireAuth,
  userProfileController.updateUserCV.bind(userProfileController)
);

router.post(
  "/upload-image",
  requireAuth,
  upload.single("image"),
  userProfileController.uploadProfileImage.bind(userProfileController)
);

export default router;
