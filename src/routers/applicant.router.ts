import { Router } from "express";
import { ApplicantController } from "../controllers/applicant.controller";
import { requireAuth } from "../middlewares/auth";

export class ApplicantRouter {
  private router: Router;
  private applicantController: ApplicantController;

  constructor() {
    this.router = Router();
    this.applicantController = new ApplicantController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use("/", requireAuth);
    this.router.patch("/", this.applicantController.setApplicantStatus);
    this.router.patch("/review", this.applicantController.setRejectedReview);

    this.router.get("/:id", this.applicantController.getApplicants);
    this.router.get("/total/:id", this.applicantController.getTotalApplicants);
    this.router.get("/profile/:username", this.applicantController.getApplicantDetail);
  }

  getRoutes(): Router {
    return this.router;
  }
}
