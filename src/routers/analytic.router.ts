import { Router } from "express";
import { AnalyticController } from "src/controllers/analytic.controller";

export class AnalyticRouter {
  private router: Router;
  private analyticController: AnalyticController;

  constructor() {
    this.router = Router();
    this.analyticController = new AnalyticController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.analyticController.getTotalGender);
  }

  getRoutes(): Router {
    return this.router;
  }
}
