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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobDiscoveryController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class JobDiscoveryController {
    discoverJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { city, province } = req.query;
                const allJobs = yield prisma_1.default.job.findMany({
                    include: {
                        location: true,
                    },
                });
                const jobsWithLocation = yield prisma_1.default.job.findMany({
                    where: {
                        location: {
                            city: city,
                        },
                    },
                    include: {
                        location: true,
                        admin: {
                            select: {
                                companyName: true,
                                logo: true,
                                description: true,
                            },
                        },
                    },
                });
                const locations = yield prisma_1.default.location.findMany({
                    where: {
                        city: city,
                    },
                });
                return res.status(200).json({
                    result: jobsWithLocation,
                    debug: {
                        totalJobs: allJobs.length,
                        matchingJobs: jobsWithLocation.length,
                        matchingLocations: locations.length,
                        queryParams: { city, province },
                    },
                });
            }
            catch (error) {
                console.error("Error in discoverJobs:", error);
                return res.status(500).json({
                    message: "Failed to fetch jobs",
                    error: process.env.NODE_ENV === "development" ? error : undefined,
                });
            }
        });
    }
    getJobById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const job = yield prisma_1.default.job.findUnique({
                    where: {
                        id: id,
                        isActive: true,
                    },
                    include: {
                        location: true,
                        admin: {
                            select: {
                                companyName: true,
                                logo: true,
                                description: true,
                            },
                        },
                    },
                });
                if (!job) {
                    return res.status(404).json({ message: "Job not found" });
                }
                return res.status(200).json({ result: job });
            }
            catch (error) {
                console.error("Error in getJobById:", error);
                return res.status(500).json({ message: "Failed to fetch job details" });
            }
        });
    }
    getRelatedJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const currentJob = yield prisma_1.default.job.findUnique({
                    where: { id },
                    select: {
                        adminId: true,
                        role: true,
                        category: true,
                    },
                });
                if (!currentJob) {
                    return res.status(404).json({ message: "Job not found" });
                }
                const relatedJobs = yield prisma_1.default.job.findMany({
                    where: {
                        isActive: true,
                        isPublished: true,
                        id: { not: id },
                        OR: [
                            { adminId: currentJob.adminId },
                            {
                                AND: [
                                    { role: currentJob.role },
                                    { category: currentJob.category },
                                ],
                            },
                        ],
                    },
                    include: {
                        location: true,
                        admin: {
                            select: {
                                companyName: true,
                                logo: true,
                                description: true,
                            },
                        },
                    },
                    take: 3,
                });
                return res.status(200).json({ result: relatedJobs });
            }
            catch (error) {
                console.error("Error in getRelatedJobs:", error);
                return res.status(500).json({ message: "Failed to fetch related jobs" });
            }
        });
    }
    getCompanyDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id); // Convert string to number
                if (isNaN(id)) {
                    return res.status(400).json({ message: "Invalid company ID" });
                }
                const company = yield prisma_1.default.admin.findUnique({
                    where: {
                        id: id,
                    },
                    include: {
                        Job: {
                            where: {
                                isActive: true,
                                isPublished: true,
                            },
                            include: {
                                location: true,
                            },
                        },
                    },
                });
                if (!company) {
                    return res.status(404).json({ message: "Company not found" });
                }
                return res.status(200).json(company);
            }
            catch (error) {
                console.error("Error in getCompanyDetails:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to fetch company details" });
            }
        });
    }
}
exports.JobDiscoveryController = JobDiscoveryController;
