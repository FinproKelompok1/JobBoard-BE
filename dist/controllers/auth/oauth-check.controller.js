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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthCheckController = void 0;
const client_1 = require("../../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
const OAUTH_IDENTIFIERS = ["OAUTH_USER_NOT_FOR_LOGIN", "oauth"];
class OAuthCheckController {
    checkOAuthUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, userType } = req.query;
                if (!email || typeof email !== "string") {
                    return res.status(400).json({ message: "Email is required" });
                }
                if (!userType || (userType !== "admin" && userType !== "user")) {
                    return res.status(400).json({ message: "Valid userType is required" });
                }
                let user;
                if (userType === "admin") {
                    user = yield prisma.admin.findUnique({
                        where: { email },
                        select: { password: true },
                    });
                }
                else {
                    user = yield prisma.user.findUnique({
                        where: { email },
                        select: { password: true },
                    });
                }
                if (!user) {
                    return res.json({ isOauthUser: false });
                }
                const isOauthUser = OAUTH_IDENTIFIERS.includes(user.password) ||
                    user.password.startsWith("fb_") ||
                    user.password.startsWith("google_");
                return res.json({ isOauthUser });
            }
            catch (error) {
                console.error("Error checking OAuth status:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.OAuthCheckController = OAuthCheckController;
