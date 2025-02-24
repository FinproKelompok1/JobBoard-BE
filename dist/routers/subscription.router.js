"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRouter = void 0;
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
class SubscriptionRouter {
    constructor() {
        this.subscriptionController = new subscription_controller_1.SubscriptionController();
        this.router = (0, express_1.Router)();
        this.initialiazeRoutes();
    }
    initialiazeRoutes() {
        this.router.get("/", this.subscriptionController.getSubscriptions);
        this.router.post("/", this.subscriptionController.createSubscription);
        this.router.get("/:subscriptionId", this.subscriptionController.getSubscriptionById);
        this.router.patch("/:subscriptionId", this.subscriptionController.editSubscription);
        this.router.delete("/:subscriptionId", this.subscriptionController.deleteSubcription);
        this.router.get("/:subscriptionId/users", this.subscriptionController.getSubscriptionUsers);
    }
    getRouter() {
        return this.router;
    }
}
exports.SubscriptionRouter = SubscriptionRouter;
