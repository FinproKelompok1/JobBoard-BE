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
exports.TransactionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const dayjs_1 = __importDefault(require("dayjs"));
const midtransClient = require("midtrans-client");
class TransactionController {
    createTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { subscriptionId, amount } = req.body;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: { username: true },
                });
                const { id } = yield prisma_1.default.transaction.create({
                    data: { userId, subscriptionId, amount, status: "pending" },
                });
                res.status(201).send({
                    message: "Transaction created successfully",
                    username: user === null || user === void 0 ? void 0 : user.username,
                    transactionId: id,
                });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to create transaction.",
                });
            }
        });
    }
    getTransactions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transactions = yield prisma_1.default.transaction.findMany({
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
                });
                res.status(200).send({ transactions });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve transactions.",
                });
            }
        });
    }
    getTransactionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.transactionId;
                const transaction = yield prisma_1.default.transaction.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        userId: true,
                        subscriptionId: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true,
                        user: { select: { fullname: true, email: true } },
                        subscription: { select: { category: true } },
                    },
                });
                res.status(200).send({ transaction });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve transactions by ID.",
                });
            }
        });
    }
    getTransactionToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { order_id, gross_amount } = req.body;
                const activeTransaction = yield prisma_1.default.transaction.findUnique({
                    where: { id: order_id },
                    select: {
                        subscriptionId: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                    },
                });
                if (activeTransaction.status === "cancel")
                    throw new Error("Transaction has been canceled");
                const subscription = yield prisma_1.default.subscription.findUnique({
                    where: { id: activeTransaction === null || activeTransaction === void 0 ? void 0 : activeTransaction.subscriptionId },
                    select: { category: true },
                });
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                    select: { fullname: true, email: true },
                });
                const snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: `${process.env.MIDTRANS_SERVER_KEY}`,
                });
                const subscriptionCategory = (subscription === null || subscription === void 0 ? void 0 : subscription.category) === "professional"
                    ? "Professional Plan"
                    : "Standard Plan";
                const parameter = {
                    transaction_details: {
                        order_id: order_id,
                        gross_amount: gross_amount,
                    },
                    customer_details: {
                        first_name: user.fullname,
                        email: user.email,
                    },
                    item_details: [
                        {
                            id: activeTransaction.subscriptionId,
                            price: activeTransaction.amount,
                            quantity: 1,
                            name: subscriptionCategory,
                        },
                    ],
                    custom_expiry: {
                        order_time: activeTransaction.createdAt,
                        expiry_duration: 1,
                        unit: "day",
                    },
                };
                const transaction = yield snap.createTransaction(parameter);
                res.status(201).send({ transactionToken: transaction.token });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to create transaction token.",
                });
            }
        });
    }
    updateTransaction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id, transaction_status } = req.body;
                yield prisma_1.default.transaction.update({
                    where: { id: order_id },
                    data: { status: transaction_status },
                });
                if (transaction_status === "settlement") {
                    const userTransaction = yield prisma_1.default.transaction.findUnique({
                        where: { id: order_id },
                        select: { subscriptionId: true, updatedAt: true, userId: true },
                    });
                    const latestSubscription = yield prisma_1.default.userSubscription.findUnique({
                        where: {
                            userId_subscriptionId: {
                                userId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.userId,
                                subscriptionId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.subscriptionId,
                            },
                            isActive: true,
                        },
                    });
                    let startDate = (0, dayjs_1.default)();
                    if (latestSubscription &&
                        (0, dayjs_1.default)(latestSubscription.endDate).isAfter((0, dayjs_1.default)())) {
                        startDate = (0, dayjs_1.default)(latestSubscription.endDate);
                        yield prisma_1.default.userSubscription.update({
                            where: {
                                userId_subscriptionId: {
                                    userId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.userId,
                                    subscriptionId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.subscriptionId,
                                },
                            },
                            data: {
                                startDate: startDate.toDate(),
                                endDate: startDate.add(30, "day").toDate(),
                                assessmentCount: 0,
                            },
                        });
                    }
                    else {
                        const endDate = startDate.add(30, "day").toDate();
                        yield prisma_1.default.userSubscription.create({
                            data: {
                                userId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.userId,
                                subscriptionId: userTransaction === null || userTransaction === void 0 ? void 0 : userTransaction.subscriptionId,
                                startDate: startDate.toDate(),
                                endDate: endDate,
                            },
                        });
                    }
                }
                res.status(200).send({
                    message: "Transaction and User Subscription updated successfully",
                });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to update transaction status.",
                });
            }
        });
    }
}
exports.TransactionController = TransactionController;
