import { Router } from "express";
import { UserTransactionController } from "../controllers/userTransaction.controller";
import { requireAuth } from "../middlewares/auth";

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
      "/",
      requireAuth,
      this.userTransactionController.getUserTransaction
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
