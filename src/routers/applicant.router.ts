import { Router } from "express";
import { ApplicantController } from "../controllers/applicant.controller";

export class ApplicantRouter {
  private router: Router;
  private applicantController: ApplicantController;

  constructor() {
    this.router = Router();
    this.applicantController = new ApplicantController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch("/", this.applicantController.setApplicantStatus);
    this.router.patch("/review", this.applicantController.setRejectedReview);
    
    this.router.get("/:id", this.applicantController.getApplicants);
    this.router.get('/total/:id',this.applicantController.getTotalApplicants)
  }

  getRoutes(): Router {
    return this.router;
  }
}
