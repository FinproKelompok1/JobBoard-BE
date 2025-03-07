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
    this.router.post("/", this.scheduleController.createSchedule);
    this.router.patch("/", this.scheduleController.updateSchedule);
    this.router.get("/reminder-schedule", this.scheduleController.reminderSchedule);
    this.router.post(
      "/applicant-schedule",
      this.scheduleController.getApplicantSchedule
    );
    this.router.delete("/delete", this.scheduleController.deleteSchedule);
  }

  getRoutes(): Router {
    return this.router;
  }
}
