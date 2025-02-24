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
                    token: token, // kirim token di response body juga
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
}
exports.AdminAuthController = AdminAuthController;
