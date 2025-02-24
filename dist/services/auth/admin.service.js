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
exports.AdminAuthService = void 0;
const client_1 = require("../../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_service_1 = require("../email.service");
const prisma = new client_1.PrismaClient();
const emailService = new email_service_1.EmailService();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
class AdminAuthService {
    register(companyName, email, noHandphone, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingAdmin = yield prisma.admin.findUnique({ where: { email } });
            if (existingAdmin)
                throw new Error("Email already registered");
            const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
            const verificationToken = jsonwebtoken_1.default.sign({ email, type: "admin" }, JWT_SECRET, {
                expiresIn: "15m",
            });
            const admin = yield prisma.admin.create({
                data: {
                    companyName,
                    email,
                    noHandphone,
                    password: hashedPassword,
                    isVerified: false,
                    description: "",
                },
            });
            yield emailService.sendVerificationEmail(email, verificationToken, companyName);
            return admin;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = yield prisma.admin.findUnique({ where: { email } });
            if (!admin)
                throw new Error("Invalid credentials");
            if (!admin.isVerified) {
                const lastUpdated = new Date(admin.updatedAt);
                const now = new Date();
                console.log(admin);
                // Cek apakah sudah lebih dari 15 menit sejak terakhir diperbarui
                if (now.getTime() - lastUpdated.getTime() > 15 * 60 * 1000) {
                    const verificationToken = jsonwebtoken_1.default.sign({ email, type: "admin" }, JWT_SECRET, {
                        expiresIn: "15m",
                    });
                    console.log("Send Email Lagi");
                    yield emailService.sendVerificationEmail(email, verificationToken, admin.companyName);
                }
                throw new Error("Please verify your email before logging in.");
            }
            const validPassword = yield bcrypt_1.default.compare(password, admin.password);
            if (!validPassword)
                throw new Error("Invalid credentials");
            return admin;
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.type !== "admin")
                    throw new Error("Invalid token type");
                const admin = yield prisma.admin.findUnique({
                    where: { email: decoded.email },
                });
                if (!admin)
                    throw new Error("Admin not found");
                if (admin.isVerified)
                    throw new Error("Email already verified");
                return yield prisma.admin.update({
                    where: { email: decoded.email },
                    data: { isVerified: true },
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    throw new Error("Verification link expired");
                }
                throw error;
            }
        });
    }
}
exports.AdminAuthService = AdminAuthService;
