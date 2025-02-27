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
exports.PasswordController = void 0;
const client_1 = require("../../../prisma/generated/client");
const email_service_1 = require("../../services/email.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const emailService = new email_service_1.EmailService();
const JWT_SECRET = process.env.JWT_SECRET;
class PasswordController {
    constructor() {
        this.forgotPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, userType } = req.body;
                if (!email || !userType) {
                    res.status(400).json({
                        message: "Email and user type are required",
                    });
                    return;
                }
                const user = userType === "admin"
                    ? yield prisma.admin.findUnique({ where: { email } })
                    : yield prisma.user.findUnique({ where: { email } });
                if (!user) {
                    res.json({
                        message: "If an account exists with this email, you will receive password reset instructions.",
                    });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({
                    email,
                    type: userType,
                }, JWT_SECRET, { expiresIn: "1h" });
                yield emailService.sendPasswordResetEmail(email, token, userType === "admin"
                    ? user.companyName
                    : user.fullname || user.username, userType === "admin");
                res.json({
                    message: "If an account exists with this email, you will receive password reset instructions.",
                });
            }
            catch (error) {
                res.status(500).json({
                    message: error.message || "An error occurred while processing your request.",
                });
            }
        });
        this.resetPassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, password, userType } = req.body;
                if (!token || !password || !userType) {
                    res.status(400).json({
                        message: "Token, password and user type are required",
                    });
                    return;
                }
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.type !== userType) {
                    res.status(400).json({
                        message: "Invalid reset token",
                    });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                if (userType === "admin") {
                    yield prisma.admin.update({
                        where: { email: decoded.email },
                        data: { password: hashedPassword },
                    });
                }
                else {
                    yield prisma.user.update({
                        where: { email: decoded.email },
                        data: { password: hashedPassword },
                    });
                }
                res.json({
                    message: "Password has been reset successfully",
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    res.status(400).json({
                        message: "Password reset link has expired",
                    });
                    return;
                }
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    res.status(400).json({
                        message: "Invalid reset token",
                    });
                    return;
                }
                res.status(400).json({
                    message: error.message || "Failed to reset password",
                });
            }
        });
        this.changePassword = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { currentPassword, newPassword } = req.body;
                const { id, role } = req.user;
                if (!currentPassword || !newPassword) {
                    res.status(400).json({
                        message: "Current password and new password are required",
                    });
                    return;
                }
                const user = role === "admin"
                    ? yield prisma.admin.findUnique({ where: { id } })
                    : yield prisma.user.findUnique({ where: { id } });
                if (!user) {
                    res.status(404).json({
                        message: "User not found",
                    });
                    return;
                }
                const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    res.status(400).json({
                        message: "Current password is incorrect",
                    });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                if (role === "admin") {
                    yield prisma.admin.update({
                        where: { id },
                        data: { password: hashedPassword },
                    });
                }
                else {
                    yield prisma.user.update({
                        where: { id },
                        data: { password: hashedPassword },
                    });
                }
                res.json({
                    message: "Password changed successfully",
                });
            }
            catch (error) {
                res.status(400).json({
                    message: error.message || "Failed to change password",
                });
            }
        });
    }
}
exports.PasswordController = PasswordController;
