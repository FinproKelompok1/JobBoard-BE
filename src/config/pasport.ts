import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
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
      callbackURL: `${process.env.BASE_URL_FE}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
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
        return done(error);
      }
    }
  )
);

export default passport;
