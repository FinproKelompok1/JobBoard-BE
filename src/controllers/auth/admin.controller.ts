import { Request, Response } from "express";
import { AdminAuthService } from "../../services/auth/admin.service";
import jwt from "jsonwebtoken";

const adminAuthService = new AdminAuthService();
const JWT_SECRET = process.env.JWT_SECRET!;

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
        token: token,
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
}
