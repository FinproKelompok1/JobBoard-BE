import express from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import UserProfileController from "../controllers/auth/userProfile.controller";
import upload from "../config/multer";

const router = express.Router();

// Get user profile
router.get(
  "/me",
  requireAuth,
  UserProfileController.getUserProfile.bind(UserProfileController)
);

// Update user profile
router.put(
  "/:userId",
  requireAuth,
  UserProfileController.updateUserProfile.bind(UserProfileController)
);

// Upload profile image
router.post(
  "/upload-image",
  requireAuth,
  upload.single("image"),
  UserProfileController.uploadProfileImage.bind(UserProfileController)
);

export default router;
