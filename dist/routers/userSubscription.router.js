"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscriptionRouter = void 0;
const express_1 = require("express");
const userSubscription_controller_1 = require("../controllers/userSubscription.controller");
class UserSubscriptionRouter {
    constructor() {
        this.userSubscriptionController = new userSubscription_controller_1.UserSubscriptionController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/:username", this.userSubscriptionController.getUserSubscription);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserSubscriptionRouter = UserSubscriptionRouter;
