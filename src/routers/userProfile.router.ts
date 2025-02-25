import express from "express";
import { requireAuth } from "../middlewares/auth";
import UserProfileController from "../controllers/auth/userProfile.controller";
import upload from "../config/multer";

const router = express.Router();

router.get(
  "/me",
  requireAuth,
  UserProfileController.getUserProfile.bind(UserProfileController)
);

router.get(
  "/check-completion",
  requireAuth,
  UserProfileController.isProfileComplete.bind(UserProfileController)
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

router.put(
  "/change-email",
  requireAuth,
  UserProfileController.changeEmail.bind(UserProfileController)
);

router.get(
  "/verify-email-change",
  UserProfileController.verifyEmailChange.bind(UserProfileController)
);

export default router;
