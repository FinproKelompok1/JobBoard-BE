import { Router } from "express";
import { AnalyticController } from "../controllers/analytic.controller";
import { requireAuth } from "../middlewares/auth";

export class AnalyticRouter {
  private router: Router;
  private analyticController: AnalyticController;

  constructor() {
    this.router = Router();
    this.analyticController = new AnalyticController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/total-demographics",
      requireAuth,
      this.analyticController.getTotalDemographics
    );
    this.router.get(
      "/salary-trends",
      requireAuth,
      this.analyticController.getSalaryTrends
    );
    this.router.get(
      "/applicant-interest",
      requireAuth,
      this.analyticController.getApplicantInterest
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
