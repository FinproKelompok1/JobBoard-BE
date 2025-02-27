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
                const { city, province, search, searchTerm, category, page = "1", limit = "6", sort = "createdAt", order = "desc", } = req.query;
                // Gunakan searchTerm jika search tidak ada
                const searchQuery = search || searchTerm;
                const pageNumber = parseInt(page);
                const limitNumber = parseInt(limit);
                if (isNaN(pageNumber) ||
                    isNaN(limitNumber) ||
                    pageNumber < 1 ||
                    limitNumber < 1) {
                    return res.status(400).json({
                        message: "Invalid pagination parameters",
                    });
                }
                const skip = (pageNumber - 1) * limitNumber;
                const whereClause = {
                    isActive: true,
                    isPublished: true,
                };
                if (city) {
                    whereClause.location = {
                        city: city,
                    };
                    if (province) {
                        whereClause.location.province = province;
                    }
                }
                if (searchQuery) {
                    whereClause.OR = [
                        { title: { contains: searchQuery, mode: "insensitive" } },
                        { role: { contains: searchQuery, mode: "insensitive" } },
                        {
                            description: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                    ];
                }
                if (category) {
                    whereClause.category = category;
                }
                const allowedSortFields = [
                    "createdAt",
                    "updatedAt",
                    "salary",
                    "title",
                    "role",
                ];
                const sortField = allowedSortFields.includes(sort)
                    ? sort
                    : "createdAt";
                const sortOrder = (order === null || order === void 0 ? void 0 : order.toLowerCase()) === "asc" ? "asc" : "desc";
                const orderBy = {};
                orderBy[sortField] = sortOrder;
                const totalCount = yield prisma_1.default.job.count({ where: whereClause });
                const jobs = yield prisma_1.default.job.findMany({
                    where: whereClause,
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
                    orderBy: orderBy,
                    skip: skip,
                    take: limitNumber,
                });
                const totalPages = Math.ceil(totalCount / limitNumber);
                return res.status(200).json({
                    result: jobs,
                    pagination: {
                        currentPage: pageNumber,
                        totalPages: totalPages,
                        totalItems: totalCount,
                        itemsPerPage: limitNumber,
                        hasNextPage: pageNumber < totalPages,
                        hasPrevPage: pageNumber > 1,
                    },
                    debug: {
                        totalJobs: totalCount,
                        matchingJobs: jobs.length,
                        queryParams: {
                            city,
                            province,
                            searchQuery,
                            category,
                            page,
                            limit,
                            sort,
                            order,
                        },
                        appliedSort: { field: sortField, direction: sortOrder },
                    },
                });
            }
            catch (error) {
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
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return res.status(200).json({ result: relatedJobs });
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to fetch related jobs" });
            }
        });
    }
    getCompanyDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
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
                            orderBy: {
                                createdAt: "desc",
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
                return res
                    .status(500)
                    .json({ message: "Failed to fetch company details" });
            }
        });
    }
}
exports.JobDiscoveryController = JobDiscoveryController;
