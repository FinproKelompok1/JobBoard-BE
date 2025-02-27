"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    compileTemplate(templateName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, "../templates/emails", `${templateName}.hbs`);
            const template = yield promises_1.default.readFile(templatePath, "utf-8");
            const compiledTemplate = handlebars_1.default.compile(template);
            return compiledTemplate(Object.assign(Object.assign({}, data), { year: new Date().getFullYear() }));
        });
    }
    sendVerificationEmail(email, token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationUrl = `${process.env.BASE_URL_FE}/auth/verify?token=${token}`;
            const html = yield this.compileTemplate("verification", {
                name,
                verificationUrl,
            });
            yield this.transporter.sendMail({
                from: `TalentBridge <${process.env.MAIL_USER}>`,
                to: email,
                subject: "Verify your TalentBridge account",
                html,
            });
        });
    }
    sendEmailChangeVerification(email, token, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationUrl = `${process.env.BASE_URL_FE}/auth/verify-email-change?token=${token}`;
            const html = yield this.compileTemplate("email-change", {
                name,
                verificationUrl,
            });
            yield this.transporter.sendMail({
                from: `TalentBridge <${process.env.MAIL_USER}>`,
                to: email,
                subject: "Verify your new email address - TalentBridge",
                html,
            });
        });
    }
    send2FASetupEmail(email, qrCodeUrl, secret) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = yield this.compileTemplate("developer-2fa", {
                qrCodeUrl,
                secret,
            });
            yield this.transporter.sendMail({
                from: `TalentBridge <${process.env.MAIL_USER}>`,
                to: email,
                subject: "TalentBridge Developer 2FA Setup",
                html,
            });
        });
    }
    sendPasswordResetEmail(email_1, token_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (email, token, name, isAdmin = false) {
            try {
                const resetUrl = `${process.env.BASE_URL_FE}/auth/reset-password?token=${token}`;
                const html = yield this.compileTemplate("reset-password", {
                    name,
                    resetUrl,
                    isAdmin,
                });
                yield this.transporter.sendMail({
                    from: `TalentBridge <${process.env.MAIL_USER}>`,
                    to: email,
                    subject: "Reset your TalentBridge password",
                    html,
                });
            }
            catch (error) {
                throw new Error("Failed to send password reset email");
            }
        });
    }
}
exports.EmailService = EmailService;
