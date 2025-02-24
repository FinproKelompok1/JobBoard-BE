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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class OAuthController {
}
exports.OAuthController = OAuthController;
_a = OAuthController;
OAuthController.handleCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            throw new Error("Authentication failed");
        }
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "24h" });
        // Set the HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax", // Changed to lax for OAuth redirects
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: "/",
        });
        res.json({ user, token });
        // res.redirect(`${process.env.NEXT_PUBLIC_BASE_URL_FE}/dashboard`);
    }
    catch (error) {
        console.error("OAuth error:", error);
        res.redirect(`${process.env.BASE_URL_FE}/login?error=${encodeURIComponent("Authentication failed")}`);
    }
});
OAuthController.handleFailure = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const error = req.query.error || "Authentication failed";
    res.redirect(`${process.env.BASE_URL_FE}/login?error=${encodeURIComponent(String(error))}`);
});
