"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticRouter = void 0;
const express_1 = require("express");
const analytic_controller_1 = require("../controllers/analytic.controller");
const auth_1 = require("../middlewares/auth");
class AnalyticRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.analyticController = new analytic_controller_1.AnalyticController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/total-demographics", auth_1.requireAuth, this.analyticController.getTotalDemographics);
        this.router.get("/salary-trends", auth_1.requireAuth, this.analyticController.getSalaryTrends);
        this.router.get("/applicant-interest", auth_1.requireAuth, this.analyticController.getApplicantInterest);
    }
    getRoutes() {
        return this.router;
    }
}
exports.AnalyticRouter = AnalyticRouter;
