"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyRouter = void 0;
const express_1 = require("express");
const company_controller_1 = require("../controllers/company.controller");
const auth_1 = require("../middlewares/auth");
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
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
        this.router.get("/profile", auth_1.requireAuth, (req, res) => {
            this.companyController.getProfile(req, res);
        });
        this.router.put("/profile", auth_1.requireAuth, upload.single("logo"), (req, res) => {
            this.companyController.updateProfile(req, res);
        });
        this.router.get("/:id", (req, res) => {
            this.companyController.getCompanyById(req, res);
        });
        this.router.put("/profile", auth_1.requireAuth, upload.single("logo"), (req, res) => {
            this.companyController.updateProfile(req, res);
        });
    }
    getRoutes() {
        return this.router;
    }
}
exports.CompanyRouter = CompanyRouter;
