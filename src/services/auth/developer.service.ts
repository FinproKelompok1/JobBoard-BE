import { PrismaClient } from "../../../prisma/generated/client";
import bcrypt from "bcrypt";
import { authenticator } from "otplib";
import QRCode from "qrcode";

const prisma = new PrismaClient();

export class DeveloperAuthService {
  private static instance: DeveloperAuthService;
  private constructor() {}

  static getInstance(): DeveloperAuthService {
    if (!DeveloperAuthService.instance) {
      DeveloperAuthService.instance = new DeveloperAuthService();
    }
    return DeveloperAuthService.instance;
  }

  async setup2FA() {
    const secret = authenticator.generateSecret();

    process.env.DEVELOPER_2FA_SECRET = secret;

    const otpauth = authenticator.keyuri(
      process.env.DEVELOPER_EMAIL!,
      "TalentBridge",
      secret
    );

    return {
      secret,
      qrCode: await QRCode.toDataURL(otpauth),
    };
  }

  async login(email: string, password: string, otpToken: string) {
    const developer = await prisma.developer.findUnique({
      where: { email },
    });

    if (!developer) {
      throw new Error("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(password, developer.password);
    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const secret = process.env.DEVELOPER_2FA_SECRET;
    if (!secret) {
      throw new Error("2FA not set up");
    }

    const isValidToken = authenticator.verify({
      token: otpToken,
      secret: secret,
    });

    if (!isValidToken) {
      throw new Error("Invalid 2FA code");
    }

    return developer;
  }

  async createInitialDeveloper() {
    const existingDeveloper = await prisma.developer.findUnique({
      where: { email: process.env.DEVELOPER_EMAIL },
    });

    if (!existingDeveloper) {
      const hashedPassword = await bcrypt.hash(
        process.env.DEVELOPER_PASSWORD!,
        10
      );

      return await prisma.developer.create({
        data: {
          email: process.env.DEVELOPER_EMAIL!,
          password: hashedPassword,
        },
      });
    }

    return existingDeveloper;
  }
}
