import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { upload } from "../index";

export class JobRouter {
  private router: Router;
  private jobController: JobController;

  constructor() {
    this.router = Router();
    this.jobController = new JobController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.jobController.getJobs);
    this.router.post(
      "/",
      upload.single("banner"),
      this.jobController.createJob
    );

    this.router.get("/:id", this.jobController.getJobDetail);
    this.router.patch("/:id", this.jobController.jobEdit);
  }

  getRoutes(): Router {
    return this.router;
  }
}
