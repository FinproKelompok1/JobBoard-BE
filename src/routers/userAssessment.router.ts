import { Router } from "express";
import { UserAssessmentController } from "../controllers/userAssessment.controller";

export class UserAssessmentRouter {
  private router: Router;
  private userAssessmentController: UserAssessmentController;

  constructor() {
    this.router = Router();
    this.userAssessmentController = new UserAssessmentController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:assessmentId",
      this.userAssessmentController.createUserAssessment
    );
    this.router.get(
      "/:userAssessmentId",
      this.userAssessmentController.getUserAssessmentById
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
