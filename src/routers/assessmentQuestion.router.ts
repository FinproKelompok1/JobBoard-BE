import { Router } from "express";
import { AssessmentQuestionController } from "../controllers/assessmentQuestion.controller";

export class AssessmentQuestionRouter {
  private router: Router;
  private assessmentQuestionController: AssessmentQuestionController;

  constructor() {
    this.router = Router();
    this.assessmentQuestionController = new AssessmentQuestionController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:assessmentId",
      this.assessmentQuestionController.createAssessmentQuestion
    );

    this.router.patch(
      "/:assessmentQuestionId",
      this.assessmentQuestionController.editAssessmentQuestion
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
