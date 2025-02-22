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
exports.UserAuthController = void 0;
const user_service_1 = require("../../services/auth/user.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userAuthService = new user_service_1.UserAuthService();
const JWT_SECRET = process.env.JWT_SECRET;
class UserAuthController {
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, username, password } = req.body;
                if (!email || !username || !password) {
                    return res.status(400).json({
                        message: "Email, username, and password are required",
                    });
                }
                yield userAuthService.register(email, username, password);
                res.status(201).json({
                    message: "Registration successful. Please check your email.",
                });
            }
            catch (error) {
                if (error.message.includes("already registered")) {
                    return res.status(409).json({ message: error.message });
                }
                res.status(400).json({ message: error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({
                        message: "Email and password are required",
                    });
                }
                const user = yield userAuthService.login(email, password);
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    role: "user",
                }, JWT_SECRET, { expiresIn: "24h" });
                console.log("Setting cookie with token:", token);
                res.cookie("token", token, {
                    httpOnly: false,
                    secure: false,
                    sameSite: "lax",
                    path: "/",
                    domain: "localhost",
                    maxAge: 24 * 60 * 60 * 1000,
                });
                console.log("Cookies set in response:", res.getHeader("Set-Cookie"));
                res.json({
                    message: "Login successful",
                    token: token,
                    user: {
                        id: user.id,
                        email: user.email,
                        fullname: user.fullname,
                        username: user.username,
                        avatar: user.avatar,
                    },
                });
            }
            catch (error) {
                if (error.message.includes("not verified")) {
                    return res.status(403).json({ message: error.message });
                }
                if (error.message.includes("Invalid credentials")) {
                    return res.status(401).json({ message: "Invalid email or password" });
                }
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    verifyEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.query;
                if (!token || typeof token !== "string") {
                    throw new Error("Invalid token");
                }
                yield userAuthService.verifyEmail(token);
                res.json({
                    message: "Email verified successfully. You can now log in.",
                });
            }
            catch (error) {
                if (error.message.includes("expired")) {
                    return res.status(410).json({ message: error.message });
                }
                if (error.message.includes("already verified")) {
                    return res.status(409).json({ message: error.message });
                }
                res.status(400).json({ message: error.message });
            }
        });
    }
    handleOAuthCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { user: profile, provider } = req;
                if (!profile || !provider) {
                    throw new Error("Invalid OAuth profile or provider");
                }
                if (!profile.emails || !((_a = profile.emails[0]) === null || _a === void 0 ? void 0 : _a.value)) {
                    throw new Error("Email is required from OAuth provider");
                }
                const user = yield userAuthService.handleOAuthLogin(profile, provider);
                const token = jsonwebtoken_1.default.sign({
                    id: user.id,
                    role: "user",
                }, JWT_SECRET, { expiresIn: "24h" });
                res.cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 24 * 60 * 60 * 1000,
                    path: "/",
                });
                res.redirect("/dashboard");
            }
            catch (error) {
                console.error("OAuth error:", error);
                res.redirect(`/login?error=${encodeURIComponent(error.message)}`);
            }
        });
    }
}
exports.UserAuthController = UserAuthController;
