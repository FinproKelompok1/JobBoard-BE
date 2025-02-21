import express, { RequestHandler } from "express";
import passport from "../config/pasport";
import { OAuthController } from "../controllers/auth/oauth.controller";
import {
  requireAuth,
  requireVerified,
  checkVerificationTimeout,
} from "../middleware/auth.middleware";
import { UserAuthController } from "../controllers/auth/user.controller";
import { AdminAuthController } from "../controllers/auth/admin.controller";
import { DeveloperAuthController } from "../controllers/auth/developer.controller";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../prisma/generated/client";
const JWT_SECRET = process.env.JWT_SECRET!;
const prisma = new PrismaClient();
const router = express.Router();

const userController = new UserAuthController();
const adminController = new AdminAuthController();
const developerController = new DeveloperAuthController();

router.post("/register/user", userController.register as RequestHandler);

router.post(
  "/login/user",
  requireVerified as RequestHandler,
  userController.login as RequestHandler
);

router.post("/register/admin", adminController.register as RequestHandler);

router.post("/login/admin", adminController.login as RequestHandler);

router.get(
  "/verify",
  checkVerificationTimeout as RequestHandler,
  async (req, res) => {
    const { type } = req.verificationToken!;
    try {
      if (type === "admin") {
        await adminController.verifyEmail(req, res);
      } else if (type === "user") {
        await userController.verifyEmail(req, res);
      } else {
        res.status(400).json({ message: "Invalid verification type" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }) as RequestHandler
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.BASE_URL_FE}/login?error=google_auth_failed`,
    session: true,
  }),
  OAuthController.handleCallback
);

router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  }) as RequestHandler
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.BASE_URL_FE}/login?error=facebook_auth_failed`,
    session: true,
  }) as RequestHandler,
  OAuthController.handleCallback as RequestHandler
);

router.post(
  "/developer/login",
  developerController.login.bind(developerController) as RequestHandler
);

router.post(
  "/developer/2fa/setup",
  developerController.setup2FA.bind(developerController) as RequestHandler
);

router.post("/logout", requireAuth as RequestHandler, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

router.post(
  "/verify-oauth",
  requireAuth as RequestHandler,
  async (req, res) => {
    const { type, username, company, phone } = req.body;

    if (req.user === undefined) {
      throw new Error();
    }

    if (req.user.role !== "none") {
      res.status(400).json({ message: "Account already verified" });
    }

    const oldUser = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!oldUser) {
      res.status(404).json({ message: "User not found" });
    }

    if (type === "user") {
      const updatedUser = await prisma.user.update({
        where: { id: oldUser?.id },
        data: {
          username,
          isVerified: true,
        },
      });

      const token = jwt.sign(
        {
          id: oldUser?.id,
          role: "user",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "User verified successfully",
        token,
        user: updatedUser,
      });
    } else {
      const updatedAdmin = await prisma.admin.create({
        data: {
          email: oldUser?.email || "",
          companyName: company,
          noHandphone: phone,
          password: oldUser?.password || "",
          description: "",
          isVerified: true,
        },
      });

      await prisma.user.delete({
        where: { id: oldUser?.id },
      });

      const token = jwt.sign(
        {
          id: oldUser?.id,
          role: "admin",
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        message: "Company verified successfully",
        token,
        user: updatedAdmin,
      });
    }
  }
);

router.get("/auth/failure", OAuthController.handleFailure as RequestHandler);

export default router;
