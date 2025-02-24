import { Router } from "express";
import { CvController } from "../controllers/cv.controller";
import { requireAuth } from "../middlewares/auth";

export class CvRouter {
  private router: Router;
  private cvController: CvController;

  constructor() {
    this.router = Router();
    this.cvController = new CvController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", requireAuth, this.cvController.createCv);

    this.router.get("/:username", this.cvController.getUserCv);
    this.router.get(
      "/download/:username",
      requireAuth,
      this.cvController.downloadCv
    );
    this.router.get("/detail/:cvId", this.cvController.getCvById);
    this.router.patch("/:cvId", this.cvController.updateCv);
  }

  getRouter(): Router {
    return this.router;
  }
}
