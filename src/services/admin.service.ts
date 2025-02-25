import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../prisma/generated/client";
import { EmailService } from "../services/email.service";

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
    if (existingAdmin) {
      throw new Error("Email already registered");
    }

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
        logo: "",
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
    if (!admin.isVerified) throw new Error("Email not verified");

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

  async changeEmail(adminId: number, newEmail: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: newEmail },
    });

    if (existingAdmin) {
      throw new Error("Email already in use");
    }

    const token = jwt.sign(
      {
        adminId,
        newEmail,
        type: "admin_email_change",
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await emailService.sendEmailChangeVerification(
      newEmail,
      token,
      admin.companyName
    );

    return { success: true, message: "Verification email sent" };
  }

  async verifyEmailChange(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        adminId: number;
        newEmail: string;
        type: string;
      };

      if (decoded.type !== "admin_email_change") {
        throw new Error("Invalid token type");
      }

      const updatedAdmin = await prisma.admin.update({
        where: { id: decoded.adminId },
        data: {
          email: decoded.newEmail,
          isVerified: true,
        },
      });

      return updatedAdmin;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      }
      throw error;
    }
  }

  async updateEmail(adminId: number, newEmail: string, password: string) {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      throw new Error("Invalid password");
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: newEmail },
    });

    if (existingAdmin) {
      throw new Error("Email already in use");
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: { email: newEmail },
    });

    return updatedAdmin;
  }
}
