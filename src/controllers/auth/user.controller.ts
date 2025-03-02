import { Request, Response } from "express";
import { UserAuthService } from "../../services/auth/user.service";
import jwt from "jsonwebtoken";

interface OAuthProfile {
  id?: string | number;
  displayName?: string;
  emails?: { value: string }[];
  photos?: { value: string }[];
  provider: string;
  _raw: string;
  _json: any;
}

interface OAuthRequest extends Omit<Request, "user"> {
  user?: OAuthProfile;
  provider?: "google" | "facebook";
}

const userAuthService = new UserAuthService();
const JWT_SECRET = process.env.JWT_SECRET!;

export class UserAuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body;

      if (!email || !username || !password) {
        return res.status(400).json({
          message: "Email, username, and password are required",
        });
      }

      await userAuthService.register(email, username, password);

      res.status(201).json({
        message: "Registration successful. Please check your email.",
      });
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      const user = await userAuthService.login(email, password);

      const token = jwt.sign(
        {
          id: user.id,
          role: "user",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        path: "/",
        domain: "localhost",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        token: token,
        user: {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          username: user.username,
          avatar: user.avatar,
        },
      });
    } catch (error: any) {
      if (error.message.includes("not verified")) {
        return res.status(403).json({ message: error.message });
      }
      if (error.message.includes("Invalid credentials")) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        throw new Error("Invalid token");
      }

      await userAuthService.verifyEmail(token);

      res.json({
        message: "Email verified successfully. You can now log in.",
      });
    } catch (error: any) {
      if (error.message.includes("expired")) {
        return res.status(410).json({ message: error.message });
      }
      if (error.message.includes("already verified")) {
        return res.status(409).json({ message: error.message });
      }
      res.status(400).json({ message: error.message });
    }
  }

  async handleOAuthCallback(req: OAuthRequest, res: Response) {
    try {
      const { user: profile, provider } = req;

      if (!profile || !provider) {
        throw new Error("Invalid OAuth profile or provider");
      }

      if (!profile.emails || !profile.emails[0]?.value) {
        throw new Error("Email is required from OAuth provider");
      }

      const user = await userAuthService.handleOAuthLogin(
        profile,
        provider as "google" | "facebook"
      );

      const token = jwt.sign(
        {
          id: user.id,
          role: "user",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.redirect("/dashboard");
    } catch (error: any) {
      res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
  }
}
