"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyRouter = void 0;
const express_1 = require("express");
const apply_controller_1 = require("../controllers/apply.controller");
const auth_1 = require("../middlewares/auth");
const multer_1 = __importDefault(require("../config/multer"));
class ApplyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.applyController = new apply_controller_1.ApplyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/submitted", auth_1.requireAuth, (req, res) => {
            this.applyController.getUserApplications(req, res);
        });
        this.router.get("/job/:jobId", auth_1.requireAuth, (req, res) => {
            this.applyController.getJobApplications(req, res);
        });
        this.router.post("/check/:jobId", auth_1.requireAuth, (req, res) => {
            this.applyController.checkApplication(req, res);
        });
        this.router.post("/submit/:jobId", auth_1.requireAuth, multer_1.default.single("resume"), (req, res) => {
            this.applyController.applyJob(req, res);
        });
        this.router.patch("/status/:jobId", auth_1.requireAuth, (req, res) => {
            this.applyController.updateApplicationStatus(req, res);
        });
        this.router.get("/statistics/:jobId", auth_1.requireAuth, (req, res) => {
            this.applyController.getApplicationStatistics(req, res);
        });
        this.router.delete("/:jobId", auth_1.requireAuth, (req, res) => {
            this.applyController.deleteApplication(req, res);
        });
    }
    getRoutes() {
        return this.router;
    }
}
exports.ApplyRouter = ApplyRouter;
exports.default = new ApplyRouter();
