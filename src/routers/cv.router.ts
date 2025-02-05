import { Router } from "express";
import { CvController } from "../controllers/cv.controller";

export class CvRouter {
  private router: Router;
  private cvController: CvController;

  constructor() {
    this.router = Router();
    this.cvController = new CvController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.cvController.createCv);

    this.router.get("/:username", this.cvController.getUserCv);
    this.router.get("/download/:username", this.cvController.downloadCv);
    this.router.get("/detail/:cvId", this.cvController.getCvById);
    this.router.patch("/:cvId", this.cvController.updateCv);
  }

  getRouter(): Router {
    return this.router;
  }
}
