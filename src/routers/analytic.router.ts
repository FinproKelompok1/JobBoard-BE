import { Router } from "express";
import { AnalyticController } from "../controllers/analytic.controller";

export class AnalyticRouter {
  private router: Router;
  private analyticController: AnalyticController;

  constructor() {
    this.router = Router();
    this.analyticController = new AnalyticController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/total-demographics", this.analyticController.getTotalDemographics);
    this.router.get("/salary-trends", this.analyticController.getSalaryTrends);
    this.router.get("/applicant-interest", this.analyticController.getApplicantInterest);
  }

  getRoutes(): Router {
    return this.router;
  }
}
