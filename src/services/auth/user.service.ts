import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../../prisma/generated/client";
import { EmailService } from "../email.service";

const prisma = new PrismaClient();
const emailService = new EmailService();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

export class UserAuthService {
  async register(email: string, username: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = jwt.sign({ email, type: "user" }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isVerified: false,
      },
    });

    await emailService.sendVerificationEmail(
      email,
      verificationToken,
      username
    );
    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");
    if (!user.isVerified) throw new Error("Email not verified");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw new Error("Invalid credentials");

    return user;
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
        type: string;
      };
      if (decoded.type !== "user") throw new Error("Invalid token type");

      const user = await prisma.user.findUnique({
        where: { email: decoded.email },
      });
      if (!user) throw new Error("User not found");
      if (user.isVerified) throw new Error("Email already verified");

      return await prisma.user.update({
        where: { email: decoded.email },
        data: { isVerified: true },
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Verification link expired");
      }
      throw error;
    }
  }

  async handleOAuthLogin(profile: any, provider: "google" | "facebook") {
    const email = profile.emails[0].value;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const username = `${profile.displayName
        .toLowerCase()
        .replace(/\s+/g, "")}${Math.random().toString(36).slice(2, 5)}`;
      user = await prisma.user.create({
        data: {
          email,
          username,
          password: await bcrypt.hash(Math.random().toString(36), SALT_ROUNDS),
          isVerified: true,
        },
      });
    }

    return user;
  }
}
