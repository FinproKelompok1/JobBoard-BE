import { Request, Response } from "express";
import { DeveloperAuthService } from "../../services/auth/developer.service";
import jwt from "jsonwebtoken";

export class DeveloperAuthController {
  private developerService = DeveloperAuthService.getInstance();

  async login(req: Request, res: Response) {
    try {
      const { email, password, otpToken } = req.body;

      if (!email || !password || !otpToken) {
        return res.status(400).json({
          message: "Email, password, and 2FA code are required",
        });
      }

      const developer = await this.developerService.login(
        email,
        password,
        otpToken
      );

      const token = jwt.sign(
        { id: developer.id, role: "developer" },
        process.env.JWT_SECRET!,
        { expiresIn: "12h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 12 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        user: {
          id: developer.id,
          email: developer.email,
          role: "developer",
        },
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  }

  async setup2FA(req: Request, res: Response) {
    try {
      const developer = await this.developerService.createInitialDeveloper();
      const setup = await this.developerService.setup2FA(); // Removed developer.id parameter

      res.json({
        message: "2FA setup successful",
        qrCode: setup.qrCode,
        secret: setup.secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
