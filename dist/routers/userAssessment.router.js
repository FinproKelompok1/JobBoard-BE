"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAssessmentRouter = void 0;
const express_1 = require("express");
const userAssessment_controller_1 = require("../controllers/userAssessment.controller");
const auth_1 = require("../middlewares/auth");
class UserAssessmentRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.userAssessmentController = new userAssessment_controller_1.UserAssessmentController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", auth_1.requireAuth, this.userAssessmentController.createUserAssessment);
        this.router.get("/:username", this.userAssessmentController.getUserAssessments);
        this.router.get("/detail/:userAssessmentId", this.userAssessmentController.getUserAssessmentById);
        this.router.patch("/:userAssessmentId", this.userAssessmentController.updateUserAssessment);
        this.router.get("/download/:username/:userAssessmentId", auth_1.requireAuth, this.userAssessmentController.downloadCertificate);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserAssessmentRouter = UserAssessmentRouter;
