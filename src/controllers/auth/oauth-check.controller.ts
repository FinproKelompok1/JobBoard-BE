// File: /src/controllers/auth/oauth-check.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "../../../prisma/generated/client";

const prisma = new PrismaClient();

// Konstanta untuk identifikasi OAuth user
const OAUTH_IDENTIFIERS = ["OAUTH_USER_NOT_FOR_LOGIN", "oauth"];

export class OAuthCheckController {
  async checkOAuthUser(req: Request, res: Response) {
    try {
      const { email, userType } = req.query;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!userType || (userType !== "admin" && userType !== "user")) {
        return res.status(400).json({ message: "Valid userType is required" });
      }

      // Ambil user berdasarkan userType
      let user;
      if (userType === "admin") {
        user = await prisma.admin.findUnique({
          where: { email },
          select: { password: true },
        });
      } else {
        user = await prisma.user.findUnique({
          where: { email },
          select: { password: true },
        });
      }

      if (!user) {
        // Jika user tidak ditemukan, return false
        return res.json({ isOauthUser: false });
      }

      // Cek apakah password mengandung indikator OAuth
      const isOauthUser =
        // Cek langsung dengan identifikasi OAuth
        OAUTH_IDENTIFIERS.includes(user.password) ||
        // Cek pola username yang menunjukkan OAuth user
        user.password.startsWith("fb_") ||
        user.password.startsWith("google_");

      return res.json({ isOauthUser });
    } catch (error) {
      console.error("Error checking OAuth status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
