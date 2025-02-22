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
exports.checkVerificationTimeout = exports.requireVerified = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const requireAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Log untuk debugging
        // console.log("Headers:", req.headers);
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
            res.status(401).json({ message: "Authentication required" });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Auth Error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
});
exports.requireAuth = requireAuth;
const requireVerified = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, userType } = req.body;
        if (userType === "admin") {
            const admin = yield prisma.admin.findUnique({ where: { email } });
            if (!(admin === null || admin === void 0 ? void 0 : admin.isVerified)) {
                return res.status(403).json({ message: "Email not verified" });
            }
        }
        else {
            const user = yield prisma.user.findUnique({ where: { email } });
            if (!(user === null || user === void 0 ? void 0 : user.isVerified)) {
                return res.status(403).json({ message: "Email not verified" });
            }
        }
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.requireVerified = requireVerified;
// export const requireDeveloper = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.user || req.user.role !== "developer") {
//       return res.status(403).json({ message: "Developer access required" });
//     }
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Developer access required" });
//   }
// };
const checkVerificationTimeout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        if (!token || typeof token !== "string") {
            throw new Error("Invalid token");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (Date.now() >= decoded.exp * 1000) {
            throw new Error("Verification link expired");
        }
        req.verificationToken = decoded;
        next();
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            res.status(400).json({ message: "Verification link expired" });
        }
        else {
            res.status(400).json({ message: error.message });
        }
    }
});
exports.checkVerificationTimeout = checkVerificationTimeout;
