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

router.post(
  "/login/admin",
  requireVerified as RequestHandler,
  adminController.login as RequestHandler
);

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
    failureRedirect: `${process.env.NEXT_PUBLIC_BASE_URL_FE}/login?error=google_auth_failed`,
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
    failureRedirect: `${process.env.NEXT_PUBLIC_BASE_URL_FE}/login?error=facebook_auth_failed`,
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
  requireAuth as RequestHandler,
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

router.get("/auth/failure", OAuthController.handleFailure as RequestHandler);

export default router;
