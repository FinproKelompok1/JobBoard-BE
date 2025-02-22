import { Router } from "express";
import { TransactionController } from "../controllers/transaction.controller";
import { requireAuth } from "../middleware/auth.middleware";

export class TransactionRouter {
  private transactionController: TransactionController;
  private router: Router;

  constructor() {
    this.transactionController = new TransactionController();
    this.router = Router();
    this.initialiazeRoutes();
  }

  private initialiazeRoutes() {
    this.router.get("/", this.transactionController.getTransactions);
    this.router.post(
      "/",
      requireAuth,
      this.transactionController.createTransaction
    );
    this.router.post(
      "/payment",
      requireAuth,
      this.transactionController.getTransactionToken
    );
    this.router.post(
      "/midtrans-webhook",
      this.transactionController.updateTransaction
    );

    this.router.get(
      "/:transactionId",
      this.transactionController.getTransactionById
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
