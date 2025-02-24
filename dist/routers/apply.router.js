"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyRouter = void 0;
const express_1 = require("express");
const apply_controller_1 = require("../controllers/apply.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("../config/multer"));
class ApplyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.applyController = new apply_controller_1.ApplyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get user's submitted applications
        this.router.get("/submitted", auth_middleware_1.requireAuth, (req, res) => {
            this.applyController.getUserApplications(req, res);
        });
        // Get all applications for a specific job posting
        this.router.get("/job/:jobId", auth_middleware_1.requireAuth, (req, res) => {
            this.applyController.getJobApplications(req, res);
        });
        // Submit new application
        this.router.post("/submit/:jobId", auth_middleware_1.requireAuth, multer_1.default.single("resume"), (req, res) => {
            // Cast req as MulterRequest karena sudah melalui multer middleware
            this.applyController.applyJob(req, res);
        });
        // Update application status
        this.router.patch("/status/:jobId", auth_middleware_1.requireAuth, (req, res) => {
            this.applyController.updateApplicationStatus(req, res);
        });
    }
    getRoutes() {
        return this.router;
    }
}
exports.ApplyRouter = ApplyRouter;
exports.default = new ApplyRouter();
