import { PrismaClient } from "../../../prisma/generated/client";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { AuthUser } from "../../types/auth";

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

export class OAuthService {
  static initialize() {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${process.env.BASE_URL_FE}/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await this.handleGoogleLogin(profile);
            done(null, user);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );

    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID!,
          clientSecret: process.env.FACEBOOK_APP_SECRET!,
          callbackURL: `${process.env.BASE_URL_FE}/auth/facebook/callback`,
          profileFields: ["id", "emails", "name"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await this.handleFacebookLogin(profile);
            done(null, user);
          } catch (error) {
            done(error as Error);
          }
        }
      )
    );

    passport.serializeUser((user: AuthUser, done) => {
      done(null, user);
    });

    passport.deserializeUser((user: AuthUser, done) => {
      done(null, user);
    });
  }

  static async handleGoogleLogin(profile: any): Promise<AuthUser> {
    const email = profile.emails[0].value;
    let user = await prisma.user.findUnique({ where: { email } });
    let admin = await prisma.admin.findUnique({ where: { email } });

    if (!user && !admin) {
      const username = `${profile.displayName
        .toLowerCase()
        .replace(/\s+/g, "")}${Math.random().toString(36).slice(2, 5)}`;
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS),
          isVerified: false,
        },
      });

      return { ...user, role: "none" };
    }

    if (admin) {
      if (admin.id !== undefined) {
        return { ...admin, role: admin.isVerified ? "admin" : "none" };
      } else {
        throw new Error("Admin ID is undefined");
      }
    }

    if (user) {
      if (user.id !== undefined) {
        return { ...user, role: user.isVerified ? "user" : "none" };
      } else {
        throw new Error("User ID is undefined");
      }
    }

    throw new Error("No user or admin found");
  }

  static async handleFacebookLogin(profile: any): Promise<AuthUser> {
    const email = profile.emails[0].value;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const username = `fb_${profile.id}_${Math.random()
        .toString(36)
        .slice(2, 5)}`;
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS),
          isVerified: true,
        },
      });
    }

    // Add role to the user object
    return { ...user, role: "user" };
  }
}
