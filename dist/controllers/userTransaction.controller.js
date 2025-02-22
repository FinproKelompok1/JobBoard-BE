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
exports.UserTransactionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class UserTransactionController {
    getUserTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.params.username;
                if (!username) {
                    res.status(400).json({ message: "User parameter is required" });
                    return;
                }
                const user = yield prisma_1.default.user.findUnique({
                    where: { username },
                    select: { id: true },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                const userTransactions = yield prisma_1.default.transaction.findMany({
                    where: { userId: user.id },
                    include: { subscription: { select: { category: true } } },
                });
                res.status(200).send({ userTransactions });
            }
            catch (error) {
                console.error("Error retrieving user transaction:", error);
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve user transaction" });
            }
        });
    }
}
exports.UserTransactionController = UserTransactionController;
