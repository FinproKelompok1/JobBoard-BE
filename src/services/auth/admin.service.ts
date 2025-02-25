import { PrismaClient } from "../../../prisma/generated/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "../email.service";

const prisma = new PrismaClient();
const emailService = new EmailService();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET!;

export class AdminAuthService {
  async register(
    companyName: string,
    email: string,
    noHandphone: string,
    password: string
  ) {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });
    if (existingAdmin) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const verificationToken = jwt.sign({ email, type: "admin" }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const admin = await prisma.admin.create({
      data: {
        companyName,
        email,
        noHandphone,
        password: hashedPassword,
        isVerified: false,
        description: "",
      },
    });

    await emailService.sendVerificationEmail(
      email,
      verificationToken,
      companyName
    );
    return admin;
  }

  async login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new Error("Invalid credentials");

    if (!admin.isVerified) {
      const lastUpdated = new Date(admin.updatedAt);
      const now = new Date();
      if (now.getTime() - lastUpdated.getTime() > 15 * 60 * 1000) {
        const verificationToken = jwt.sign(
          { email, type: "admin" },
          JWT_SECRET,
          {
            expiresIn: "15m",
          }
        );

        await emailService.sendVerificationEmail(
          email,
          verificationToken,
          admin.companyName
        );
      }

      throw new Error("Please verify your email before logging in.");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) throw new Error("Invalid credentials");

    return admin;
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        email: string;
        type: string;
      };
      if (decoded.type !== "admin") throw new Error("Invalid token type");

      const admin = await prisma.admin.findUnique({
        where: { email: decoded.email },
      });
      if (!admin) throw new Error("Admin not found");
      if (admin.isVerified) throw new Error("Email already verified");

      return await prisma.admin.update({
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
}
