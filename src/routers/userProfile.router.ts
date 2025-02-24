import express from "express";
import { requireAuth } from "../middleware/auth.middleware";
import UserProfileController from "../controllers/auth/userProfile.controller";
import upload from "../config/multer";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  UserProfileController.getUserProfile.bind(UserProfileController)
);

router.put(
  "/:userId",
  requireAuth,
  UserProfileController.updateUserProfile.bind(UserProfileController)
);

router.post(
  "/upload-image",
  requireAuth,
  upload.single("image"),
  UserProfileController.uploadProfileImage.bind(UserProfileController)
);

router.put(
  "/change-password",
  requireAuth,
  UserProfileController.changePassword
);

router.put(
  "/applications/:jobId/take",
  requireAuth,
  UserProfileController.takeJob.bind(UserProfileController)
);

export default router;
