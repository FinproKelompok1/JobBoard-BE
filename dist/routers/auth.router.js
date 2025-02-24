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
const express_1 = __importDefault(require("express"));
const pasport_1 = __importDefault(require("../config/pasport"));
const oauth_controller_1 = require("../controllers/auth/oauth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_controller_1 = require("../controllers/auth/user.controller");
const admin_controller_1 = require("../controllers/auth/admin.controller");
const developer_controller_1 = require("../controllers/auth/developer.controller");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../../prisma/generated/client");
const JWT_SECRET = process.env.JWT_SECRET;
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Initialize controllers
const userController = new user_controller_1.UserAuthController();
const adminController = new admin_controller_1.AdminAuthController();
const developerController = new developer_controller_1.DeveloperAuthController();
// User Authentication Routes
router.post("/register/user", userController.register);
router.post("/login/user", auth_middleware_1.requireVerified, userController.login);
// Admin Authentication Routes
router.post("/register/admin", adminController.register);
router.post("/login/admin", 
// requireVerified as RequestHandler,
adminController.login);
// Email Verification Route
router.get("/verify", auth_middleware_1.checkVerificationTimeout, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.verificationToken;
    try {
        if (type === "admin") {
            yield adminController.verifyEmail(req, res);
        }
        else if (type === "user") {
            yield userController.verifyEmail(req, res);
        }
        else {
            res.status(400).json({ message: "Invalid verification type" });
        }
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
}));
// OAuth routes
router.get("/google", pasport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
router.get("/google/callback", pasport_1.default.authenticate("google", {
    failureRedirect: `${process.env.BASE_URL_FE}/login?error=google_auth_failed`,
    session: true,
}), oauth_controller_1.OAuthController.handleCallback);
router.get("/facebook", pasport_1.default.authenticate("facebook", {
    scope: ["email"],
}));
router.get("/facebook/callback", pasport_1.default.authenticate("facebook", {
    failureRedirect: `${process.env.BASE_URL_FE}/login?error=facebook_auth_failed`,
    session: true,
}), oauth_controller_1.OAuthController.handleCallback);
// Developer routes
router.post("/developer/login", developerController.login.bind(developerController));
router.post("/developer/2fa/setup", 
// requireAuth as RequestHandler,
developerController.setup2FA.bind(developerController));
// Logout route
router.post("/logout", auth_middleware_1.requireAuth, (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.json({ message: "Logged out successfully" });
});
router.post("/verify-oauth", auth_middleware_1.requireAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, username, company, phone } = req.body;
    if (req.user === undefined) {
        throw new Error();
    }
    if (req.user.role !== "none") {
        res.status(400).json({ message: "Account already verified" });
    }
    const oldUser = yield prisma.user.findUnique({
        where: { id: req.user.id },
    });
    if (!oldUser) {
        res.status(404).json({ message: "User not found" });
    }
    if (type === "user") {
        const updatedUser = yield prisma.user.update({
            where: { id: oldUser === null || oldUser === void 0 ? void 0 : oldUser.id },
            data: {
                username,
                isVerified: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            id: oldUser === null || oldUser === void 0 ? void 0 : oldUser.id,
            role: "user",
        }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
            message: "User verified successfully",
            token,
            user: updatedUser,
        });
    }
    else {
        const updatedAdmin = yield prisma.admin.create({
            data: {
                email: (oldUser === null || oldUser === void 0 ? void 0 : oldUser.email) || "",
                companyName: company,
                noHandphone: phone,
                password: (oldUser === null || oldUser === void 0 ? void 0 : oldUser.password) || "",
                description: "",
                isVerified: true,
            },
        });
        yield prisma.user.delete({
            where: { id: oldUser === null || oldUser === void 0 ? void 0 : oldUser.id },
        });
        const token = jsonwebtoken_1.default.sign({
            id: oldUser === null || oldUser === void 0 ? void 0 : oldUser.id,
            role: "admin",
        }, JWT_SECRET, { expiresIn: "24h" });
        res.json({
            message: "Company verified successfully",
            token,
            user: updatedAdmin,
        });
    }
}));
// OAuth failure route
router.get("/auth/failure", oauth_controller_1.OAuthController.handleFailure);
exports.default = router;
