import { Router } from "express";
import { ScheduleController } from "../controllers/schedule.controller";

export class ScheduleRouter {
  private router: Router;
  private scheduleController: ScheduleController;

  constructor() {
    this.router = Router();
    this.scheduleController = new ScheduleController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.scheduleController.getSchedules);
    this.router.post("/", this.scheduleController.createSchedule);
    this.router.post(
      "/applicant-schedule",
      this.scheduleController.getApplicantSchedule
    );
  }

  getRoutes(): Router {
    return this.router;
  }
}
