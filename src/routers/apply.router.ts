import { Router, Request, Response } from "express";
import { ApplyController } from "../controllers/apply.controller";
import { requireAuth } from "../middlewares/auth";
import upload from "../config/multer";
import { AuthUser } from "../types/auth";

interface MulterRequest extends Request {
  file: Express.Multer.File;
  user?: AuthUser;
}

export class ApplyRouter {
  private router: Router;
  private applyController: ApplyController;

  constructor() {
    this.router = Router();
    this.applyController = new ApplyController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/submitted",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.getUserApplications(req, res);
      }
    );

    this.router.get(
      "/job/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.getJobApplications(req, res);
      }
    );

    this.router.post(
      "/check/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.checkApplication(req, res);
      }
    );

    this.router.post(
      "/submit/:jobId",
      requireAuth,
      upload.single("resume"),
      (req: Request, res: Response) => {
        this.applyController.applyJob(req as MulterRequest, res);
      }
    );

    this.router.patch(
      "/status/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.updateApplicationStatus(req, res);
      }
    );

    this.router.get(
      "/statistics/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.getApplicationStatistics(req, res);
      }
    );

    this.router.delete(
      "/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.deleteApplication(req, res);
      }
    );
  }

  public getRoutes(): Router {
    return this.router;
  }
}

export default new ApplyRouter();
