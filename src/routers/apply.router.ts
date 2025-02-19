import { Router, Request, Response } from "express";
import { ApplyController } from "../controllers/apply.controller";
import { requireAuth } from "../middleware/auth.middleware";
import upload from "../config/multer";
import { AuthUser } from "../types/auth";

// Definisikan interface MulterRequest
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
    // Get user's submitted applications
    this.router.get(
      "/submitted",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.getUserApplications(req, res);
      }
    );

    // Get all applications for a specific job posting
    this.router.get(
      "/job/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.getJobApplications(req, res);
      }
    );

    // Submit new application
    this.router.post(
      "/submit/:jobId",
      requireAuth,
      upload.single("resume"),
      (req: Request, res: Response) => {
        // Cast req as MulterRequest karena sudah melalui multer middleware
        this.applyController.applyJob(req as MulterRequest, res);
      }
    );

    // Update application status
    this.router.patch(
      "/status/:jobId",
      requireAuth,
      (req: Request, res: Response) => {
        this.applyController.updateApplicationStatus(req, res);
      }
    );
  }

  public getRoutes(): Router {
    return this.router;
  }
}

export default new ApplyRouter();
