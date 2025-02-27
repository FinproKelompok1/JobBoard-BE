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
const client_1 = require("../../prisma/generated/client");
const cloudinary_1 = require("./cloudinary");
const prisma = new client_1.PrismaClient();
class ApplyService {
    createApplication(userId, jobId, resume, expectedSalary) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !jobId || !resume || !expectedSalary) {
                    throw new Error("All fields are required");
                }
                const job = yield prisma.job.findFirst({
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
                const existingApplication = yield prisma.jobApplication.findFirst({
                    where: {
                        AND: [{ userId: userId }, { jobId: jobId }],
                    },
                });
                if (existingApplication) {
                    throw new Error("You have already applied for this job");
                }
                const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(resume, "resumes");
                const newApplication = yield prisma.jobApplication.create({
                    data: {
                        userId: userId,
                        jobId: jobId,
                        resume: uploadResult.secure_url,
                        expectedSalary: expectedSalary,
                        isTaken: false,
                        status: "processed",
                    },
                });
                return newApplication;
            }
            catch (error) {
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
                const existingApplication = yield prisma.jobApplication.findFirst({
                    where: {
                        AND: [{ userId: userId }, { jobId: jobId }],
                    },
                });
                if (!existingApplication) {
                    throw new Error("Application not found");
                }
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
    deleteApplication(userId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingApplication = yield prisma.jobApplication.findFirst({
                    where: {
                        AND: [{ userId: userId }, { jobId: jobId }],
                    },
                });
                if (!existingApplication) {
                    throw new Error("Application not found");
                }
                return yield prisma.jobApplication.delete({
                    where: {
                        userId_jobId: {
                            userId,
                            jobId,
                        },
                    },
                });
            }
            catch (error) {
                throw error;
            }
        });
    }
    getApplicationStatistics(jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const applications = yield prisma.jobApplication.findMany({
                    where: { jobId },
                    select: {
                        status: true,
                    },
                });
                const statistics = {
                    total: applications.length,
                    processed: applications.filter((app) => app.status === "processed")
                        .length,
                    interviewed: applications.filter((app) => app.status === "interviewed")
                        .length,
                    accepted: applications.filter((app) => app.status === "accepted")
                        .length,
                    rejected: applications.filter((app) => app.status === "rejected")
                        .length,
                };
                return statistics;
            }
            catch (error) {
                throw error;
            }
        });
    }
    checkExistingApplication(userId, jobId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const application = yield prisma.jobApplication.findFirst({
                    where: {
                        AND: [{ userId: userId }, { jobId: jobId }],
                    },
                });
                return !!application;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.ApplyService = ApplyService;
