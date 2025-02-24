"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRouter = void 0;
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
class TransactionRouter {
    constructor() {
        this.transactionController = new transaction_controller_1.TransactionController();
        this.router = (0, express_1.Router)();
        this.initialiazeRoutes();
    }
    initialiazeRoutes() {
        this.router.get("/", this.transactionController.getTransactions);
        this.router.post("/", auth_middleware_1.requireAuth, this.transactionController.createTransaction);
        this.router.post("/payment", auth_middleware_1.requireAuth, this.transactionController.getTransactionToken);
        this.router.post("/midtrans-webhook", this.transactionController.updateTransaction);
        this.router.get("/:transactionId", this.transactionController.getTransactionById);
    }
    getRouter() {
        return this.router;
    }
}
exports.TransactionRouter = TransactionRouter;
