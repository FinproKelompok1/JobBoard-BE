"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreselectionRouter = void 0;
const express_1 = require("express");
const preselection_controller_1 = require("../controllers/preselection.controller");
class PreselectionRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.preselectionController = new preselection_controller_1.PreselectionController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.preselectionController.createPreSelection);
    }
    getRoutes() {
        return this.router;
    }
}
exports.PreselectionRouter = PreselectionRouter;
