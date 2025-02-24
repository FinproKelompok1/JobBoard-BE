"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentRouter = void 0;
const express_1 = require("express");
const assessment_controller_1 = require("../controllers/assessment.controller");
class AssessmentRouter {
    constructor() {
        this.assessmentController = new assessment_controller_1.AssessmentController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.assessmentController.createAssessment);
        this.router.get("/", this.assessmentController.getAssessment);
        this.router.get("/:assessmentId/questions", this.assessmentController.getAssessmentQuestion);
        this.router.get("/:assessmentId", this.assessmentController.getAssessmentById);
        this.router.patch("/:assessmentId", this.assessmentController.switchAssessmentStatus);
    }
    getRouter() {
        return this.router;
    }
}
exports.AssessmentRouter = AssessmentRouter;
