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
            var _a, _b;
            try {
                const { page = "1", limit = "10", sort = "createdAt", order = "desc", status, } = req.query;
                const pageNumber = parseInt(page, 10);
                const pageSize = parseInt(limit, 10);
                const skip = (pageNumber - 1) * pageSize;
                const orderBy = { [sort]: order === "desc" ? "desc" : "asc" };
                const where = {};
                if (status) {
                    where.status = status;
                }
                const userTransactions = yield prisma_1.default.transaction.findMany({
                    where: Object.assign({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, where),
                    select: {
                        id: true,
                        userId: true,
                        subscriptionId: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        user: { select: { email: true } },
                        subscription: { select: { category: true } },
                    },
                    skip,
                    take: pageSize,
                    orderBy,
                });
                const totalTransactions = yield prisma_1.default.transaction.count({
                    where: Object.assign({ userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id }, where),
                });
                res.status(200).send({
                    userTransactions,
                    totalPages: Math.ceil(totalTransactions / pageSize),
                    currentPage: pageNumber,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve user transaction" });
            }
        });
    }
}
exports.UserTransactionController = UserTransactionController;
