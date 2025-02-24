import express from "express";
import { PasswordController } from "../../controllers/auth/password.controller";
import { requireAuth } from "../../middleware/auth.middleware";

const router = express.Router();
const passwordController = new PasswordController();

router.post("/forgot-password", passwordController.forgotPassword);
router.post("/reset-password", passwordController.resetPassword);
router.put("/change-password", requireAuth, passwordController.changePassword);

export default router;
// src/services/password.service.ts
import { PrismaClient } from "@prisma/client";
import { EmailService } from "../email.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const emailService = new EmailService();

export class PasswordService {
  async forgotPassword(email: string, isCompany: boolean) {
    // Find user or admin
    const user = isCompany
      ? await prisma.admin.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return {
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      };
    }

    // Generate reset token
    const resetToken = jwt.sign(
      {
        id: user.id,
        type: isCompany ? "admin_password_reset" : "password_reset",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // Send reset email
    await emailService.sendPasswordResetEmail(
      email,
      resetToken,
      isCompany
        ? (user as any).companyName
        : (user as any).fullname || (user as any).username,
      isCompany
    );

    return {
      message:
        "If an account exists with this email, you will receive password reset instructions.",
    };
  }

  async resetPassword(token: string, newPassword: string, isCompany: boolean) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: number;
        type: string;
      };

      const expectedType = isCompany
        ? "admin_password_reset"
        : "password_reset";
      if (decoded.type !== expectedType) {
        throw new Error("Invalid reset token");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      if (isCompany) {
        await prisma.admin.update({
          where: { id: decoded.id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.user.update({
          where: { id: decoded.id },
          data: { password: hashedPassword },
        });
      }

      return { message: "Password has been reset successfully" };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Password reset link has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid reset token");
      }
      throw error;
    }
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    isCompany: boolean
  ) {
    // Find user or admin
    const user = isCompany
      ? await prisma.admin.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (isCompany) {
      await prisma.admin.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    }

    return { message: "Password changed successfully" };
  }
}
