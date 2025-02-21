import { Router, Request, Response } from "express";
import { CompanyController } from "../controllers/company.controller";
import { requireAuth } from "../middleware/auth.middleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

    this.router.get("/profile", requireAuth, (req: Request, res: Response) => {
      this.companyController.getProfile(req, res);
    });

    this.router.put(
      "/profile",
      requireAuth,
      upload.single("logo"),
      (req: Request, res: Response) => {
        this.companyController.updateProfile(req, res);
      }
    );

    this.router.get("/:id", (req: Request, res: Response) => {
      this.companyController.getCompanyById(req, res);
    });

    this.router.put(
      "/profile",
      requireAuth,
      upload.single("logo"),
      (req: Request, res: Response) => {
        this.companyController.updateProfile(req, res);
      }
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
