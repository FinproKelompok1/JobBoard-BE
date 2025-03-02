import { Router } from "express";
import { AssessmentController } from "../controllers/assessment.controller";

export class AssessmentRouter {
  private router: Router;
  private assessmentController: AssessmentController;

  constructor() {
    this.assessmentController = new AssessmentController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.assessmentController.createAssessment);
    this.router.get("/", this.assessmentController.getAssessment);

    this.router.get(
      "/:assessmentId/questions",
      this.assessmentController.getAssessmentQuestion
    );
    this.router.get(
      "/:assessmentId",
      this.assessmentController.getAssessmentById
    );
    this.router.patch(
      "/:assessmentId",
      this.assessmentController.switchAssessmentStatus
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
