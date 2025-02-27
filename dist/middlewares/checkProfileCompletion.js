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
exports.checkProfileCompletion = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
const checkProfileCompletion = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return next();
        }
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: {
                gender: true,
                dob: true,
                lastEdu: true,
                domicileId: true,
            },
        });
        if (!user ||
            !user.gender ||
            !user.dob ||
            !user.lastEdu ||
            !user.domicileId) {
            res.status(403).json({
                success: false,
                message: "Profile completion required",
                incompleteProfile: true,
                missingFields: {
                    gender: !(user === null || user === void 0 ? void 0 : user.gender),
                    dob: !(user === null || user === void 0 ? void 0 : user.dob),
                    lastEdu: !(user === null || user === void 0 ? void 0 : user.lastEdu),
                    domicileId: !(user === null || user === void 0 ? void 0 : user.domicileId),
                },
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error("Error checking profile completion:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.checkProfileCompletion = checkProfileCompletion;
exports.default = exports.checkProfileCompletion;
