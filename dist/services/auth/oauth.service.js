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
exports.OAuthService = void 0;
const client_1 = require("../../../prisma/generated/client");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
class OAuthService {
    static initialize() {
        passport_1.default.use(new passport_google_oauth20_1.Strategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL_FE}/auth/google/callback`,
        }, (accessToken, refreshToken, profile, done) => __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.handleGoogleLogin(profile);
                done(null, user);
            }
            catch (error) {
                done(error);
            }
        })));
        passport_1.default.serializeUser((user, done) => {
            done(null, user);
        });
        passport_1.default.deserializeUser((user, done) => {
            done(null, user);
        });
    }
    static handleGoogleLogin(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            const email = profile.emails[0].value;
            let user = yield prisma.user.findUnique({ where: { email } });
            let admin = yield prisma.admin.findUnique({ where: { email } });
            if (!user && !admin) {
                const username = `${profile.displayName
                    .toLowerCase()
                    .replace(/\s+/g, "")}${Math.random().toString(36).slice(2, 5)}`;
                user = yield prisma.user.create({
                    data: {
                        email,
                        username,
                        password: "oauth",
                        isVerified: false,
                    },
                });
                return Object.assign(Object.assign({}, user), { role: "none" });
            }
            if (admin) {
                if (admin.id !== undefined) {
                    return Object.assign(Object.assign({}, admin), { role: admin.isVerified ? "admin" : "none" });
                }
                else {
                    throw new Error("Admin ID is undefined");
                }
            }
            if (user) {
                if (user.id !== undefined) {
                    return Object.assign(Object.assign({}, user), { role: user.isVerified ? "user" : "none" });
                }
                else {
                    throw new Error("User ID is undefined");
                }
            }
            throw new Error("No user or admin found");
        });
    }
}
exports.OAuthService = OAuthService;
