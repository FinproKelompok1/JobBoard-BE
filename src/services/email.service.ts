import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private async compileTemplate(
    templateName: string,
    data: any
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "../templates/emails",
      `${templateName}.hbs`
    );
    const template = await fs.readFile(templatePath, "utf-8");
    const compiledTemplate = handlebars.compile(template);
    return compiledTemplate({
      ...data,
      year: new Date().getFullYear(),
    });
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const verificationUrl = `${process.env.BASE_URL_FE}/auth/verify?token=${token}`;
    const html = await this.compileTemplate("verification", {
      name,
      verificationUrl,
    });

    await this.transporter.sendMail({
      from: `TalentBridge <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify your TalentBridge account",
      html,
    });
  }

  async sendEmailChangeVerification(
    email: string,
    token: string,
    name: string
  ) {
    const verificationUrl = `${process.env.BASE_URL_FE}/auth/verify-email-change?token=${token}`;
    const html = await this.compileTemplate("email-change", {
      name,
      verificationUrl,
    });

    await this.transporter.sendMail({
      from: `TalentBridge <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Verify your new email address - TalentBridge",
      html,
    });
  }

  async send2FASetupEmail(email: string, qrCodeUrl: string, secret: string) {
    const html = await this.compileTemplate("developer-2fa", {
      qrCodeUrl,
      secret,
    });

    await this.transporter.sendMail({
      from: `TalentBridge <${process.env.MAIL_USER}>`,
      to: email,
      subject: "TalentBridge Developer 2FA Setup",
      html,
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    name: string,
    isAdmin: boolean = false
  ) {
    try {
      const resetUrl = `${process.env.BASE_URL_FE}/auth/reset-password?token=${token}`;

      const html = await this.compileTemplate("reset-password", {
        name,
        resetUrl,
        isAdmin,
      });

      await this.transporter.sendMail({
        from: `TalentBridge <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Reset your TalentBridge password",
        html,
      });
    } catch (error) {
      throw new Error("Failed to send password reset email");
    }
  }
}
