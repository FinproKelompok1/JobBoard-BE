import { Router } from "express";
import { JobController } from "../controllers/job.controller";
import { upload } from "../index";
import { requireAuth } from "../middlewares/auth";

export class JobRouter {
  private router: Router;
  private jobController: JobController;

  constructor() {
    this.router = Router();
    this.jobController = new JobController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", requireAuth, this.jobController.getJobs);
    this.router.post(
      "/",
      upload.single("banner"),
      requireAuth,
      this.jobController.createJob
    );

    this.router.get("/total", requireAuth, this.jobController.totalJobs);
    this.router.get("/:id", this.jobController.getJobDetail);
    this.router.patch(
      "/:id",
      upload.single("banner"),
      this.jobController.jobEdit
    );
    this.router.patch("/delete/:id", this.jobController.deleteJob);
    this.router.patch("/publish/:id", this.jobController.setPublishJob);
  }

  getRoutes(): Router {
    return this.router;
  }
}
