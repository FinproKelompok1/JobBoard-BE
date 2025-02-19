import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:userId/:jobId", this.reviewController.createReview);
  }

  getRouter(): Router {
    return this.router;
  }
}
