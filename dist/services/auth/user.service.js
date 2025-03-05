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
exports.UserAuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../../../prisma/generated/client");
const email_service_1 = require("../email.service");
const prisma = new client_1.PrismaClient();
const emailService = new email_service_1.EmailService();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
class UserAuthService {
    register(email, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error("Email already registered");
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
            const verificationToken = jsonwebtoken_1.default.sign({ email, type: "user" }, JWT_SECRET, {
                expiresIn: "1h",
            });
            const user = yield prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    isVerified: false,
                },
            });
            yield emailService.sendVerificationEmail(email, verificationToken, username);
            return user;
        });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error("Invalid credentials");
            if (!user.isVerified)
                throw new Error("Email not verified");
            const validPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!validPassword)
                throw new Error("Invalid credentials");
            return user;
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.type !== "user")
                    throw new Error("Invalid token type");
                const user = yield prisma.user.findUnique({
                    where: { email: decoded.email },
                });
                if (!user)
                    throw new Error("User not found");
                if (user.isVerified)
                    throw new Error("Email already verified");
                return yield prisma.user.update({
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
    handleOAuthLogin(profile, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = profile.emails[0].value;
            let user = yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                const username = `${profile.displayName
                    .toLowerCase()
                    .replace(/\s+/g, "")}${Math.random().toString(36).slice(2, 5)}`;
                user = yield prisma.user.create({
                    data: {
                        email,
                        username,
                        password: yield bcrypt_1.default.hash(Math.random().toString(36), SALT_ROUNDS),
                        isVerified: true,
                    },
                });
            }
            return user;
        });
    }
}
exports.UserAuthService = UserAuthService;
