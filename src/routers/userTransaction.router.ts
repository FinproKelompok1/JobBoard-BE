import { Router } from "express";
import { UserTransactionController } from "../controllers/userTransaction.controller";
import { requireAuth } from "src/middleware/auth.middleware";

export class UserTransactionRouter {
  private router: Router;
  private userTransactionController: UserTransactionController;

  constructor() {
    this.router = Router();
    this.userTransactionController = new UserTransactionController();
    this.initialiazeRoutes();
  }

  private initialiazeRoutes() {
    this.router.get(
      "/:username",
      this.userTransactionController.getUserTransaction
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
