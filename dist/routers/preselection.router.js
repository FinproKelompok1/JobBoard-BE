"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreselectionRouter = void 0;
const express_1 = require("express");
const preselection_controller_1 = require("../controllers/preselection.controller");
const checkPreselection_1 = require("../middlewares/checkPreselection");
const auth_1 = require("../middlewares/auth");
class PreselectionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.preselectionController = new preselection_controller_1.PreselectionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.preselectionController.createPreselection);
        this.router.get("/:id", this.preselectionController.getPreselection);
        this.router.get("/questions/:id", this.preselectionController.getPreselectionQuestions);
        this.router.post("/questions/:id", auth_1.requireAuth, this.preselectionController.submitPreselection);
        this.router.patch("/active/:id", checkPreselection_1.checkPreselection, this.preselectionController.setActiveTest);
    }
    getRoutes() {
        return this.router;
    }
}
exports.PreselectionRouter = PreselectionRouter;
