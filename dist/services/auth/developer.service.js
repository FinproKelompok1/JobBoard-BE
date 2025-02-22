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
exports.DeveloperAuthService = void 0;
const client_1 = require("../../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const prisma = new client_1.PrismaClient();
class DeveloperAuthService {
    constructor() { }
    static getInstance() {
        if (!DeveloperAuthService.instance) {
            DeveloperAuthService.instance = new DeveloperAuthService();
        }
        return DeveloperAuthService.instance;
    }
    setup2FA() {
        return __awaiter(this, void 0, void 0, function* () {
            // Generate a secret for developer
            const secret = otplib_1.authenticator.generateSecret();
            // Instead of storing in database, we'll use environment variable
            process.env.DEVELOPER_2FA_SECRET = secret;
            const otpauth = otplib_1.authenticator.keyuri(process.env.DEVELOPER_EMAIL, "TalentBridge", secret);
            return {
                secret,
                qrCode: yield qrcode_1.default.toDataURL(otpauth),
            };
        });
    }
    login(email, password, otpToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const developer = yield prisma.developer.findUnique({
                where: { email },
            });
            if (!developer) {
                throw new Error("Invalid credentials");
            }
            const validPassword = yield bcrypt_1.default.compare(password, developer.password);
            if (!validPassword) {
                throw new Error("Invalid credentials");
            }
            // Verify 2FA token using environment variable
            const secret = process.env.DEVELOPER_2FA_SECRET;
            if (!secret) {
                throw new Error("2FA not set up");
            }
            const isValidToken = otplib_1.authenticator.verify({
                token: otpToken,
                secret: secret,
            });
            if (!isValidToken) {
                throw new Error("Invalid 2FA code");
            }
            return developer;
        });
    }
    createInitialDeveloper() {
        return __awaiter(this, void 0, void 0, function* () {
            const existingDeveloper = yield prisma.developer.findUnique({
                where: { email: process.env.DEVELOPER_EMAIL },
            });
            if (!existingDeveloper) {
                const hashedPassword = yield bcrypt_1.default.hash(process.env.DEVELOPER_PASSWORD, 10);
                return yield prisma.developer.create({
                    data: {
                        email: process.env.DEVELOPER_EMAIL,
                        password: hashedPassword,
                    },
                });
            }
            return existingDeveloper;
        });
    }
}
exports.DeveloperAuthService = DeveloperAuthService;
