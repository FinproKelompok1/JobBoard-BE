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
exports.AdminAuthController = void 0;
const admin_service_1 = require("../../services/auth/admin.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const adminAuthService = new admin_service_1.AdminAuthService();
const JWT_SECRET = process.env.JWT_SECRET;
class AdminAuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { companyName, email, noHandphone, password } = req.body;
                yield adminAuthService.register(companyName, email, noHandphone, password);
                res
                    .status(201)
                    .json({ message: "Registration successful. Please check your email." });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const admin = yield adminAuthService.login(email, password);
                const token = jsonwebtoken_1.default.sign({ id: admin.id, role: "admin" }, JWT_SECRET, {
                    expiresIn: "24h",
                });
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.json({
                    message: "Login successful",
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email,
                        companyName: admin.companyName,
                        logo: admin.logo,
                    },
                });
            }
            catch (error) {
                res.status(401).json({ message: error.message });
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.query;
                if (!token || typeof token !== "string")
                    throw new Error("Invalid token");
                yield adminAuthService.verifyEmail(token);
                res.json({ message: "Email verified successfully" });
            }
            catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    }
    changeEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin")
                    return res
                        .status(403)
                        .json({ message: "Forbidden: Admin access required" });
                const adminId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!adminId)
                    return res.status(401).json({ message: "Unauthorized" });
                const { newEmail, password } = req.body;
                if (!newEmail || !password)
                    return res
                        .status(400)
                        .json({ message: "Email and password are required" });
                yield adminAuthService.changeEmail(adminId, newEmail, password);
                res.status(200).json({
                    success: true,
                    message: "Verification email sent. Please check your new email to complete the change.",
                });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to change email" });
            }
        });
    }
    verifyEmailChange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.query;
                if (!token || typeof token !== "string")
                    return res.status(400).json({ message: "Invalid token" });
                yield adminAuthService.verifyEmailChange(token);
                res
                    .status(200)
                    .json({ success: true, message: "Email changed successfully" });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to verify email change" });
            }
        });
    }
    updateEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin")
                    return res
                        .status(403)
                        .json({ message: "Forbidden: Admin access required" });
                const adminId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!adminId)
                    return res.status(401).json({ message: "Unauthorized" });
                const { newEmail, password } = req.body;
                if (!newEmail || !password)
                    return res
                        .status(400)
                        .json({ message: "Email and password are required" });
                const admin = yield prisma.admin.findUnique({ where: { id: adminId } });
                if (!admin)
                    return res.status(404).json({ message: "Admin not found" });
                const validPassword = yield bcrypt_1.default.compare(password, admin.password);
                if (!validPassword)
                    return res.status(400).json({ message: "Invalid password" });
                const existingAdmin = yield prisma.admin.findUnique({
                    where: { email: newEmail },
                });
                if (existingAdmin)
                    return res.status(400).json({ message: "Email already in use" });
                const updatedAdmin = yield prisma.admin.update({
                    where: { id: adminId },
                    data: { email: newEmail },
                });
                const token = jsonwebtoken_1.default.sign({ id: adminId, role: "admin" }, JWT_SECRET, {
                    expiresIn: "24h",
                });
                res.status(200).json({
                    success: true,
                    message: "Email updated successfully",
                    admin: {
                        id: updatedAdmin.id,
                        email: updatedAdmin.email,
                        companyName: updatedAdmin.companyName,
                        logo: updatedAdmin.logo,
                    },
                    token,
                });
            }
            catch (error) {
                res
                    .status(400)
                    .json({ message: error.message || "Failed to update email" });
            }
        });
    }
}
exports.AdminAuthController = AdminAuthController;
