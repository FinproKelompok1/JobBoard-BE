"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CvRouter = void 0;
const express_1 = require("express");
const cv_controller_1 = require("../controllers/cv.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
class CvRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.cvController = new cv_controller_1.CvController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", auth_middleware_1.requireAuth, this.cvController.createCv);
        this.router.get("/:username", this.cvController.getUserCv);
        this.router.get("/download/:username", auth_middleware_1.requireAuth, this.cvController.downloadCv);
        this.router.get("/detail/:cvId", this.cvController.getCvById);
        this.router.patch("/:cvId", this.cvController.updateCv);
    }
    getRouter() {
        return this.router;
    }
}
exports.CvRouter = CvRouter;
