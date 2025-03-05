import { Router } from "express";
import { SubscriptionController } from "../controllers/subscription.controller";

export class SubscriptionRouter {
  private subscriptionController: SubscriptionController;
  private router: Router;

  constructor() {
    this.subscriptionController = new SubscriptionController();
    this.router = Router();
    this.initialiazeRoutes();
  }

  private initialiazeRoutes() {
    this.router.get("/", this.subscriptionController.getSubscriptions);
    this.router.post("/", this.subscriptionController.createSubscription);
    this.router.post(
      "/send-subscription-email",
      this.subscriptionController.sendSubscriptionEmail
    );

    this.router.get(
      "/:subscriptionId",
      this.subscriptionController.getSubscriptionById
    );
    this.router.patch(
      "/:subscriptionId",
      this.subscriptionController.editSubscription
    );
    this.router.delete(
      "/:subscriptionId",
      this.subscriptionController.deleteSubcription
    );
    this.router.get(
      "/:subscriptionId/users",
      this.subscriptionController.getSubscriptionUsers
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
