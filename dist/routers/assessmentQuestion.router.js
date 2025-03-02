"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentQuestionRouter = void 0;
const express_1 = require("express");
const assessmentQuestion_controller_1 = require("../controllers/assessmentQuestion.controller");
class AssessmentQuestionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.assessmentQuestionController = new assessmentQuestion_controller_1.AssessmentQuestionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/:assessmentId", this.assessmentQuestionController.createAssessmentQuestion);
        this.router.patch("/:assessmentQuestionId", this.assessmentQuestionController.editAssessmentQuestion);
    }
    getRouter() {
        return this.router;
    }
}
exports.AssessmentQuestionRouter = AssessmentQuestionRouter;
