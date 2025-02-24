import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { PrismaClient } from "../../prisma/generated/client";
import { AuthUser } from "../types/auth";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const OAUTH_DEFAULT_PASSWORD = "OAUTH_USER_NOT_FOR_LOGIN";
const HASHED_OAUTH_PASSWORD = bcrypt.hashSync(OAUTH_DEFAULT_PASSWORD, 10);

passport.serializeUser((user: AuthUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return done(null, null);
    }
    const userWithRole: AuthUser = { ...user, role: "user" };
    done(null, userWithRole);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:3000/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth callback received:", { profile });

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email provided from Google"));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              username: `google_${profile.id}`,
              password: HASHED_OAUTH_PASSWORD,
              isVerified: true,
              avatar: profile.photos?.[0]?.value || "",
              fullname: profile.displayName || null,
            },
          });
        }

        const authUser: AuthUser = { ...user, role: "user" };
        return done(null, authUser);
      } catch (error) {
        console.error("Google OAuth error:", error);
        return done(error);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${process.env.BASE_URL_BE}/auth/google/callback`,
      profileFields: ["id", "emails", "name", "photos"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook OAuth callback received:", { profile });

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email provided from Facebook"));
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              username: `fb_${profile.id}`,
              password: HASHED_OAUTH_PASSWORD,
              isVerified: true,
              avatar: profile.photos?.[0]?.value || "",
              fullname: profile.displayName || null,
            },
          });
        }

        const authUser: AuthUser = { ...user, role: "user" };
        return done(null, authUser);
      } catch (error) {
        console.error("Facebook OAuth error:", error);
        return done(error);
      }
    }
  )
);

export default passport;
