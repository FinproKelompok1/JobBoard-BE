"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantRouter = void 0;
const express_1 = require("express");
const applicant_controller_1 = require("../controllers/applicant.controller");
class ApplicantRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.applicantController = new applicant_controller_1.ApplicantController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch("/", this.applicantController.setApplicantStatus);
        this.router.patch("/review", this.applicantController.setRejectedReview);
        this.router.get("/:id", this.applicantController.getApplicants);
        this.router.get('/total/:id', this.applicantController.getTotalApplicants);
    }
    getRoutes() {
        return this.router;
    }
}
exports.ApplicantRouter = ApplicantRouter;
