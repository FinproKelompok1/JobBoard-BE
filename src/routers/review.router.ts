import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { requireAuth } from "../middleware/auth.middleware";

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.router = Router();
    this.reviewController = new ReviewController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:jobId",
      requireAuth,
      this.reviewController.createReview
    );
    this.router.get(
      "/:jobId",
      requireAuth,
      this.reviewController.getUserReview
    );
    this.router.get(
      "/company/:adminId",
      this.reviewController.getCompanyReviews
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
