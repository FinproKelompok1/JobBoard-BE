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

    this.router.get("/:id", this.subscriptionController.getSubscriptionById);
    this.router.patch("/:id", this.subscriptionController.editSubscription);
    this.router.delete("/:id", this.subscriptionController.deleteSubcription);
  }

  getRouter(): Router {
    return this.router;
  }
}
