import { Request, Response } from "express";
import { PrismaClient } from "../../../prisma/generated/client";
import { EmailService } from "../../services/email.service";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthUser, VerificationToken } from "../../types/auth";

const prisma = new PrismaClient();
const emailService = new EmailService();
const JWT_SECRET = process.env.JWT_SECRET!;

type RequestHandler = (req: Request, res: Response) => Promise<void>;

export class PasswordController {
  public forgotPassword: RequestHandler = async (req, res) => {
    try {
      const { email, userType } = req.body;

      if (!email || !userType) {
        res.status(400).json({
          message: "Email and user type are required",
        });
        return;
      }

      const user =
        userType === "admin"
          ? await prisma.admin.findUnique({ where: { email } })
          : await prisma.user.findUnique({ where: { email } });

      if (!user) {
        res.json({
          message:
            "If an account exists with this email, you will receive password reset instructions.",
        });
        return;
      }

      const token = jwt.sign(
        {
          email,
          type: userType,
        },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      await emailService.sendPasswordResetEmail(
        email,
        token,
        userType === "admin"
          ? (user as any).companyName
          : (user as any).fullname || (user as any).username,
        userType === "admin"
      );

      res.json({
        message:
          "If an account exists with this email, you will receive password reset instructions.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        message:
          error.message || "An error occurred while processing your request.",
      });
    }
  };

  public resetPassword: RequestHandler = async (req, res) => {
    try {
      const { token, password, userType } = req.body;

      if (!token || !password || !userType) {
        res.status(400).json({
          message: "Token, password and user type are required",
        });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as VerificationToken;

      if (decoded.type !== userType) {
        res.status(400).json({
          message: "Invalid reset token",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      if (userType === "admin") {
        await prisma.admin.update({
          where: { email: decoded.email },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.user.update({
          where: { email: decoded.email },
          data: { password: hashedPassword },
        });
      }

      res.json({
        message: "Password has been reset successfully",
      });
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(400).json({
          message: "Password reset link has expired",
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({
          message: "Invalid reset token",
        });
        return;
      }

      console.error("Reset password error:", error);
      res.status(400).json({
        message: error.message || "Failed to reset password",
      });
    }
  };

  public changePassword: RequestHandler = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const { id, role } = req.user as AuthUser;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          message: "Current password and new password are required",
        });
        return;
      }

      const user =
        role === "admin"
          ? await prisma.admin.findUnique({ where: { id } })
          : await prisma.user.findUnique({ where: { id } });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        res.status(400).json({
          message: "Current password is incorrect",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      if (role === "admin") {
        await prisma.admin.update({
          where: { id },
          data: { password: hashedPassword },
        });
      } else {
        await prisma.user.update({
          where: { id },
          data: { password: hashedPassword },
        });
      }

      res.json({
        message: "Password changed successfully",
      });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(400).json({
        message: error.message || "Failed to change password",
      });
    }
  };
}
