"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserTransactionRouter = void 0;
const express_1 = require("express");
const userTransaction_controller_1 = require("../controllers/userTransaction.controller");
const auth_1 = require("../middlewares/auth");
class UserTransactionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userTransactionController = new userTransaction_controller_1.UserTransactionController();
        this.initialiazeRoutes();
    }
    initialiazeRoutes() {
        this.router.get("/", auth_1.requireAuth, this.userTransactionController.getUserTransaction);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserTransactionRouter = UserTransactionRouter;
