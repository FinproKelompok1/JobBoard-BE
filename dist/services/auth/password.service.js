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
exports.PasswordService = void 0;
const express_1 = __importDefault(require("express"));
const password_controller_1 = require("../../controllers/auth/password.controller");
const auth_1 = require("../../middlewares/auth");
const router = express_1.default.Router();
const passwordController = new password_controller_1.PasswordController();
router.post("/forgot-password", passwordController.forgotPassword);
router.post("/reset-password", passwordController.resetPassword);
router.put("/change-password", auth_1.requireAuth, passwordController.changePassword);
exports.default = router;
const client_1 = require("@prisma/client");
const email_service_1 = require("../email.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const emailService = new email_service_1.EmailService();
class PasswordService {
    forgotPassword(email, isCompany) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = isCompany
                ? yield prisma.admin.findUnique({ where: { email } })
                : yield prisma.user.findUnique({ where: { email } });
            if (!user) {
                return {
                    message: "If an account exists with this email, you will receive password reset instructions.",
                };
            }
            const resetToken = jsonwebtoken_1.default.sign({
                id: user.id,
                type: isCompany ? "admin_password_reset" : "password_reset",
            }, process.env.JWT_SECRET, { expiresIn: "1h" });
            yield emailService.sendPasswordResetEmail(email, resetToken, isCompany
                ? user.companyName
                : user.fullname || user.username, isCompany);
            return {
                message: "If an account exists with this email, you will receive password reset instructions.",
            };
        });
    }
    resetPassword(token, newPassword, isCompany) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const expectedType = isCompany
                    ? "admin_password_reset"
                    : "password_reset";
                if (decoded.type !== expectedType) {
                    throw new Error("Invalid reset token");
                }
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                if (isCompany) {
                    yield prisma.admin.update({
                        where: { id: decoded.id },
                        data: { password: hashedPassword },
                    });
                }
                else {
                    yield prisma.user.update({
                        where: { id: decoded.id },
                        data: { password: hashedPassword },
                    });
                }
                return { message: "Password has been reset successfully" };
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    throw new Error("Password reset link has expired");
                }
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    throw new Error("Invalid reset token");
                }
                throw error;
            }
        });
    }
    changePassword(userId, currentPassword, newPassword, isCompany) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = isCompany
                ? yield prisma.admin.findUnique({ where: { id: userId } })
                : yield prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new Error("User not found");
            }
            const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new Error("Current password is incorrect");
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            if (isCompany) {
                yield prisma.admin.update({
                    where: { id: userId },
                    data: { password: hashedPassword },
                });
            }
            else {
                yield prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword },
                });
            }
            return { message: "Password changed successfully" };
        });
    }
}
exports.PasswordService = PasswordService;
