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
exports.DeveloperAuthController = void 0;
const developer_service_1 = require("../../services/auth/developer.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class DeveloperAuthController {
    constructor() {
        this.developerService = developer_service_1.DeveloperAuthService.getInstance();
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, otpToken } = req.body;
                if (!email || !password || !otpToken) {
                    return res.status(400).json({
                        message: "Email, password, and 2FA code are required",
                    });
                }
                const developer = yield this.developerService.login(email, password, otpToken);
                const token = jsonwebtoken_1.default.sign({ id: developer.id, role: "developer" }, process.env.JWT_SECRET, { expiresIn: "12h" });
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 12 * 60 * 60 * 1000,
                });
                res.json({
                    message: "Login successful",
                    token,
                    user: {
                        id: developer.id,
                        email: developer.email,
                        role: "developer",
                    },
                });
            }
            catch (error) {
                res.status(401).json({ message: error.message });
            }
        });
    }
    setup2FA(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const developer = yield this.developerService.createInitialDeveloper();
                const setup = yield this.developerService.setup2FA();
                res.json({
                    message: "2FA setup successful",
                    qrCode: setup.qrCode,
                    secret: setup.secret,
                });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.DeveloperAuthController = DeveloperAuthController;
