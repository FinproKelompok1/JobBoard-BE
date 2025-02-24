"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyController = void 0;
const apply_service_1 = require("../services/apply.service");
class ApplyController {
    constructor() {
        this.applyService = new apply_service_1.ApplyService();
    }
    applyJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id: jobId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const resume = req.file;
                if (!resume) {
                    return res.status(400).json({ message: "Resume file is required" });
                }
                const expectedSalary = parseInt(req.body.expectedSalary);
                if (!expectedSalary) {
                    return res.status(400).json({ message: "Expected salary is required" });
                }
                const application = yield this.applyService.createApplication(userId, jobId, resume, expectedSalary);
                return res.status(201).json({
                    message: "Application submitted successfully",
                    data: application,
                });
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(400).json({ message: error.message });
                }
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getUserApplications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const applications = yield this.applyService.getUserApplications(userId);
                return res.status(200).json({ data: applications });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getJobApplications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                    return res.status(403).json({ message: "Admin access required" });
                }
                const { jobId } = req.params;
                const applications = yield this.applyService.getJobApplications(jobId);
                return res.status(200).json({ data: applications });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    updateApplicationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                    return res.status(403).json({ message: "Admin access required" });
                }
                const { jobId } = req.params;
                const { userId, status, rejectedReview } = req.body;
                const application = yield this.applyService.updateStatus(userId, jobId, status, rejectedReview);
                return res.status(200).json({
                    message: "Application status updated successfully",
                    data: application,
                });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.ApplyController = ApplyController;
