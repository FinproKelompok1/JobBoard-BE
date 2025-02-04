import { Router } from "express";
import { UserSubscriptionController } from "../controllers/userSubscription.controller";

export class UserSubscriptionRouter {
  private userSubscriptionController: UserSubscriptionController;
  private router: Router;

  constructor() {
    this.userSubscriptionController = new UserSubscriptionController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/:username",
      this.userSubscriptionController.getUserSubscription
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
