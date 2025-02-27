"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobDiscoveryRouter = void 0;
const express_1 = require("express");
const jobdis_controller_1 = require("../controllers/jobdis.controller");
class JobDiscoveryRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.jobDiscoveryController = new jobdis_controller_1.JobDiscoveryController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", (req, res) => {
            this.jobDiscoveryController.discoverJobs(req, res);
        });
        this.router.get("/:id", (req, res) => {
            this.jobDiscoveryController.getJobById(req, res);
        });
        this.router.get("/:id/related", (req, res) => {
            this.jobDiscoveryController.getRelatedJobs(req, res);
        });
        this.router.get("/company/:id", (req, res) => {
            this.jobDiscoveryController.getCompanyDetails(req, res);
        });
    }
    getRoutes() {
        return this.router;
    }
}
exports.JobDiscoveryRouter = JobDiscoveryRouter;
