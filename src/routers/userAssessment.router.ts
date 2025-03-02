import { Router } from "express";
import { UserAssessmentController } from "../controllers/userAssessment.controller";
import { requireAuth } from "../middlewares/auth";

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
      "/",
      requireAuth,
      this.userAssessmentController.createUserAssessment
    );
    this.router.get(
      "/:username",
      this.userAssessmentController.getUserAssessments
    );
    this.router.get(
      "/detail/:userAssessmentId",
      this.userAssessmentController.getUserAssessmentById
    );
    this.router.patch(
      "/:userAssessmentId",
      this.userAssessmentController.updateUserAssessment
    );
    this.router.get(
      "/download/:username/:userAssessmentId",
      requireAuth,
      this.userAssessmentController.downloadCertificate
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
