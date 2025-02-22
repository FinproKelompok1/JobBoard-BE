"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRouter = void 0;
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
class ScheduleRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.scheduleController = new schedule_controller_1.ScheduleController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.scheduleController.createSchedule);
        this.router.patch("/", this.scheduleController.updateSchedule);
        this.router.post("/applicant-schedule", this.scheduleController.getApplicantSchedule);
        this.router.delete("/delete", this.scheduleController.deleteSchedule);
    }
    getRoutes() {
        return this.router;
    }
}
exports.ScheduleRouter = ScheduleRouter;
