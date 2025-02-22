"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticRouter = void 0;
const express_1 = require("express");
const analytic_controller_1 = require("../controllers/analytic.controller");
class AnalyticRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.analyticController = new analytic_controller_1.AnalyticController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/total-demographics", this.analyticController.getTotalDemographics);
        this.router.get("/salary-trends", this.analyticController.getSalaryTrends);
        this.router.get("/applicant-interest", this.analyticController.getApplicantInterest);
    }
    getRoutes() {
        return this.router;
    }
}
exports.AnalyticRouter = AnalyticRouter;
