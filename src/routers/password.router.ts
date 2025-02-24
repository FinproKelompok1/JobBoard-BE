import express from "express";
import { PasswordController } from "../controllers/auth/password.controller";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();
const passwordController = new PasswordController();

router.post("/forgot-password", passwordController.forgotPassword);
router.post("/reset-password", passwordController.resetPassword);
router.put("/change-password", requireAuth, passwordController.changePassword);

export default router;
