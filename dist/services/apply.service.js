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
exports.ApplyService = void 0;
// src/services/apply.service.ts
const client_1 = require("../../prisma/generated/client");
const cloudinary_1 = require("./cloudinary");
const prisma = new client_1.PrismaClient();
class ApplyService {
    createApplication(userId, jobId, resume, expectedSalary) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Debug log untuk input
                console.log("Attempting to create application:", {
                    userId,
                    jobId,
                    salary: expectedSalary,
                });
                // Cek job validity
                const job = yield prisma.job.findUnique({
                    where: {
                        id: jobId,
                        isActive: true,
                    },
                    select: {
                        id: true,
                        endDate: true,
                        title: true,
                    },
                });
                if (!job) {
                    throw new Error("Job not found or not active");
                }
                if (new Date() > job.endDate) {
                    throw new Error("The application deadline has passed");
                }
                // Cek existing application dengan Query yang lebih spesifik
                const applications = yield prisma.jobApplication.findMany({
                    where: {
                        userId: userId,
                    },
                    select: {
                        jobId: true,
                    },
                });
                // Debug log untuk applications
                console.log("Existing applications for user:", applications);
                const hasApplied = applications.some((app) => app.jobId === jobId);
                // Debug log untuk hasil pengecekan
                console.log("Application check result:", {
                    hasApplied,
                    checkingJobId: jobId,
                });
                if (hasApplied) {
                    throw new Error("You have already applied for this job");
                }
                // Proses upload dan create application
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(resume, "resumes");
                return yield prisma.jobApplication.create({
                    data: {
                        userId,
                        jobId,
                        resume: uploadResult.secure_url,
                        expectedSalary,
                        isTaken: false,
                        status: "processed",
                    },
                });
            }
            catch (error) {
                console.error("Application creation error:", error);
                throw error;
            }
        });
    }
    getUserApplications(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.jobApplication.findMany({
                    where: { userId },
                    include: {
                        job: {
                            include: {
                                admin: true,
                                location: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getJobApplications(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.jobApplication.findMany({
                    where: { jobId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                email: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateStatus(userId, jobId, status, rejectedReview) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield prisma.jobApplication.update({
                    where: {
                        userId_jobId: {
                            userId,
                            jobId,
                        },
                    },
                    data: {
                        status,
                        rejectedReview,
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.ApplyService = ApplyService;
