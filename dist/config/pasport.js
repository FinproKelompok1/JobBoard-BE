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
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const client_1 = require("../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const OAUTH_DEFAULT_PASSWORD = "OAUTH_USER_NOT_FOR_LOGIN";
const HASHED_OAUTH_PASSWORD = bcrypt_1.default.hashSync(OAUTH_DEFAULT_PASSWORD, 10);
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user) {
            return done(null, null);
        }
        const userWithRole = Object.assign(Object.assign({}, user), { role: "user" });
        done(null, userWithRole);
    }
    catch (error) {
        done(error, null);
    }
}));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true,
}, (req, accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
        if (!email) {
            return done(new Error("No email provided from Google"));
        }
        let user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    email,
                    username: `google_${profile.id}`,
                    password: HASHED_OAUTH_PASSWORD,
                    isVerified: true,
                    avatar: ((_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || "",
                    fullname: profile.displayName || null,
                },
            });
        }
        const authUser = Object.assign(Object.assign({}, user), { role: "user" });
        return done(null, authUser);
    }
    catch (error) {
        return done(error);
    }
})));
exports.default = passport_1.default;
