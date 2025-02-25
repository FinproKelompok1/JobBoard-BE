import { Request, Response } from "express";
import { AdminAuthService } from "../../services/auth/admin.service";
import jwt from "jsonwebtoken";
import { AuthUser } from "../../types/auth";
import { PrismaClient } from "../../../prisma/generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const adminAuthService = new AdminAuthService();
const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthRequest extends Request {
  user?: AuthUser;
}

export class AdminAuthController {
  async register(req: Request, res: Response) {
    try {
      const { companyName, email, noHandphone, password } = req.body;
      await adminAuthService.register(
        companyName,
        email,
        noHandphone,
        password
      );
      res
        .status(201)
        .json({ message: "Registration successful. Please check your email." });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const admin = await adminAuthService.login(email, password);
      const token = jwt.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json({
        message: "Login successful",
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          companyName: admin.companyName,
          logo: admin.logo,
        },
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") throw new Error("Invalid token");
      await adminAuthService.verifyEmail(token);
      res.json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async changeEmail(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "admin")
        return res
          .status(403)
          .json({ message: "Forbidden: Admin access required" });
      const adminId = req.user?.id;
      if (!adminId) return res.status(401).json({ message: "Unauthorized" });
      const { newEmail, password } = req.body;
      if (!newEmail || !password)
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      await (adminAuthService as any).changeEmail(adminId, newEmail, password);
      res.status(200).json({
        success: true,
        message:
          "Verification email sent. Please check your new email to complete the change.",
      });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to change email" });
    }
  }

  async verifyEmailChange(req: Request, res: Response) {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string")
        return res.status(400).json({ message: "Invalid token" });
      await (adminAuthService as any).verifyEmailChange(token);
      res
        .status(200)
        .json({ success: true, message: "Email changed successfully" });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to verify email change" });
    }
  }

  async updateEmail(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== "admin")
        return res
          .status(403)
          .json({ message: "Forbidden: Admin access required" });
      const adminId = req.user?.id;
      if (!adminId) return res.status(401).json({ message: "Unauthorized" });
      const { newEmail, password } = req.body;
      if (!newEmail || !password)
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      const admin = await prisma.admin.findUnique({ where: { id: adminId } });
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      const validPassword = await bcrypt.compare(password, admin.password);
      if (!validPassword)
        return res.status(400).json({ message: "Invalid password" });
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: newEmail },
      });
      if (existingAdmin)
        return res.status(400).json({ message: "Email already in use" });
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: { email: newEmail },
      });
      const token = jwt.sign({ id: adminId, role: "admin" }, JWT_SECRET, {
        expiresIn: "24h",
      });
      res.status(200).json({
        success: true,
        message: "Email updated successfully",
        admin: {
          id: updatedAdmin.id,
          email: updatedAdmin.email,
          companyName: updatedAdmin.companyName,
          logo: updatedAdmin.logo,
        },
        token,
      });
    } catch (error: any) {
      res
        .status(400)
        .json({ message: error.message || "Failed to update email" });
    }
  }
}
