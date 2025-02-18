import { Router, Request, Response } from "express";
import { JobDiscoveryController } from "../controllers/jobdis.controller";

export class JobDiscoveryRouter {
  private router: Router;
  private jobDiscoveryController: JobDiscoveryController;

  constructor() {
    this.router = Router();
    this.jobDiscoveryController = new JobDiscoveryController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", (req: Request, res: Response) => {
      this.jobDiscoveryController.discoverJobs(req, res);
    });

    this.router.get("/:id", (req: Request, res: Response) => {
      this.jobDiscoveryController.getJobById(req, res);
    });

    this.router.get("/:id/related", (req: Request, res: Response) => {
      this.jobDiscoveryController.getRelatedJobs(req, res);
    });
  }

  getRoutes(): Router {
    return this.router;
  }
}
