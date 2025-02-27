"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRouter = void 0;
const express_1 = require("express");
const job_controller_1 = require("../controllers/job.controller");
const index_1 = require("../index");
const auth_1 = require("../middlewares/auth");
class JobRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.jobController = new job_controller_1.JobController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", auth_1.requireAuth, this.jobController.getJobs);
        this.router.post("/", index_1.upload.single("banner"), auth_1.requireAuth, this.jobController.createJob);
        this.router.get("/total", auth_1.requireAuth, this.jobController.totalJobs);
        this.router.get("/:id", this.jobController.getJobDetail);
        this.router.patch("/:id", index_1.upload.single("banner"), this.jobController.jobEdit);
        this.router.patch("/delete/:id", this.jobController.deleteJob);
        this.router.patch("/publish/:id", this.jobController.setPublishJob);
    }
    getRoutes() {
        return this.router;
    }
}
exports.JobRouter = JobRouter;
