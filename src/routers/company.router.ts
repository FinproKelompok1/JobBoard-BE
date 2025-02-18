import { Router, Request, Response } from "express";
import { CompanyController } from "../controllers/company.controller";

export class CompanyRouter {
  private router: Router;
  private companyController: CompanyController;

  constructor() {
    this.router = Router();
    this.companyController = new CompanyController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", (req: Request, res: Response) => {
      this.companyController.getCompanies(req, res);
    });

    this.router.get("/:id", (req: Request, res: Response) => {
      this.companyController.getCompanyById(req, res);
    });
  }

  getRoutes(): Router {
    return this.router;
  }
}
