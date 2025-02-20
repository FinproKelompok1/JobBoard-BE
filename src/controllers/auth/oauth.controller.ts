import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../../types/auth";

export class OAuthController {
  static handleCallback = async (req: Request, res: Response) => {
    try {
      const user = req.user as AuthUser;

      if (!user) {
        throw new Error("Authentication failed");
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
      );

      // Set the HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed to lax for OAuth redirects
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      });

      res.json({ user, token });
      // res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL_FE}/dashboard`);
    } catch (error) {
      console.error("OAuth error:", error);
      res.redirect(
        `${process.env.BASE_URL_FE}/login?error=${encodeURIComponent(
          "Authentication failed"
        )}`
      );
    }
  };

  static handleFailure = async (req: Request, res: Response) => {
    const error = req.query.error || "Authentication failed";
    res.redirect(
      `${process.env.BASE_URL_FE}/login?error=${encodeURIComponent(
        String(error)
      )}`
    );
  };
}
