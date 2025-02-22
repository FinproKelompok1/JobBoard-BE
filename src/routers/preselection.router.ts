import { Router } from "express";
import { PreselectionController } from "../controllers/preselection.controller";
import { checkPreselection } from "../middlewares/checkPreselection";

export class PreselectionRouter {
  private router: Router;
  private preselectionController: PreselectionController;

  constructor() {
    this.router = Router();
    this.preselectionController = new PreselectionController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/", this.preselectionController.createPreselection);
    this.router.get("/:id", this.preselectionController.getPreselection);
    this.router.get(
      "/questions/:id",
      this.preselectionController.getPreselectionQuestions
    );
    this.router.post(
      "/questions/:id",
      this.preselectionController.submitPreselection
    );
    this.router.patch(
      "/active/:id",
      checkPreselection,
      this.preselectionController.setActiveTest
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
