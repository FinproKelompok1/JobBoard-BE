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
                const jobId = req.params.jobId;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                if (!jobId) {
                    return res.status(400).json({ message: "Job ID is required" });
                }
                const resume = req.file;
                if (!resume) {
                    return res.status(400).json({ message: "Resume file is required" });
                }
                const expectedSalary = parseInt(req.body.expectedSalary);
                if (isNaN(expectedSalary) || expectedSalary <= 0) {
                    return res
                        .status(400)
                        .json({ message: "Valid expected salary is required" });
                }
                const application = yield this.applyService.createApplication(Number(userId), jobId, resume, expectedSalary);
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
                const applications = yield this.applyService.getUserApplications(Number(userId));
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
                if (!jobId) {
                    return res.status(400).json({ message: "Job ID is required" });
                }
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
                if (!jobId || !userId || !status) {
                    return res
                        .status(400)
                        .json({ message: "JobId, userId and status are required" });
                }
                const validStatuses = [
                    "processed",
                    "interviewed",
                    "accepted",
                    "rejected",
                ];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({ message: "Invalid status value" });
                }
                const application = yield this.applyService.updateStatus(Number(userId), jobId, status, rejectedReview);
                return res.status(200).json({
                    message: "Application status updated successfully",
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
    deleteApplication(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { jobId } = req.params;
                if (!userId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                if (!jobId) {
                    return res.status(400).json({ message: "Job ID is required" });
                }
                yield this.applyService.deleteApplication(Number(userId), jobId);
                return res
                    .status(200)
                    .json({ message: "Application deleted successfully" });
            }
            catch (error) {
                if (error instanceof Error) {
                    return res.status(400).json({ message: error.message });
                }
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getApplicationStatistics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin") {
                    return res.status(403).json({ message: "Admin access required" });
                }
                const { jobId } = req.params;
                if (!jobId) {
                    return res.status(400).json({ message: "Job ID is required" });
                }
                const statistics = yield this.applyService.getApplicationStatistics(jobId);
                return res.status(200).json({ data: statistics });
            }
            catch (error) {
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    checkApplication(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { jobId } = req.params;
                if (!userId || !jobId) {
                    return res.status(400).json({
                        hasApplied: false,
                        message: "Unauthorized or invalid job ID",
                    });
                }
                const hasApplied = yield this.applyService.checkExistingApplication(Number(userId), jobId);
                return res.status(200).json({
                    hasApplied,
                    message: "Application check successful",
                });
            }
            catch (error) {
                return res.status(500).json({
                    hasApplied: false,
                    message: "Internal server error",
                });
            }
        });
    }
}
exports.ApplyController = ApplyController;
