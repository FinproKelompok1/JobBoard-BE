"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRouter = void 0;
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
class CompanyRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.companyController = new company_controller_1.CompanyController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", (req, res) => {
            this.companyController.getCompanies(req, res);
        });
        this.router.get("/:id", (req, res) => {
            this.companyController.getCompanyById(req, res);
        });
    }
    getRoutes() {
        return this.router;
    }
}
exports.CompanyRouter = CompanyRouter;
