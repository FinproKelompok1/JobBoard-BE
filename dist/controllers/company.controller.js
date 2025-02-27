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
exports.CompanyController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const cloudinary_1 = require("../services/cloudinary");
class CompanyController {
    getCompanies(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const totalCompanies = yield prisma_1.default.admin.count({
                    where: {
                        isVerified: true,
                    },
                });
                const totalPages = Math.ceil(totalCompanies / limit);
                const companies = yield prisma_1.default.admin.findMany({
                    where: {
                        isVerified: true,
                    },
                    skip: skip,
                    take: limit,
                    select: {
                        id: true,
                        companyName: true,
                        logo: true,
                        description: true,
                        _count: {
                            select: {
                                Job: {
                                    where: {
                                        isActive: true,
                                        isPublished: true,
                                    },
                                },
                            },
                        },
                        Job: {
                            where: {
                                isActive: true,
                                isPublished: true,
                            },
                            select: {
                                location: {
                                    select: {
                                        city: true,
                                        province: true,
                                    },
                                },
                            },
                        },
                    },
                });
                const formattedCompanies = companies.map((company) => ({
                    id: company.id,
                    companyName: company.companyName,
                    logo: company.logo,
                    description: company.description,
                    jobCount: company._count.Job,
                    Job: company.Job.map((job) => ({
                        location: job.location,
                    })),
                }));
                return res.status(200).json({
                    data: formattedCompanies,
                    meta: {
                        page,
                        limit,
                        totalItems: totalCompanies,
                        totalPages,
                    },
                });
            }
            catch (error) {
                return res.status(500).json({
                    message: "Failed to fetch companies",
                    error: process.env.NODE_ENV === "development" ? error : undefined,
                });
            }
        });
    }
    getCompanyById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const companyId = parseInt(id);
                if (isNaN(companyId)) {
                    return res.status(400).json({ message: "Invalid company ID" });
                }
                const company = yield prisma_1.default.admin.findUnique({
                    where: {
                        id: companyId,
                    },
                    select: {
                        id: true,
                        companyName: true,
                        email: true,
                        noHandphone: true,
                        description: true,
                        logo: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
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
                const response = Object.assign(Object.assign({}, company), { jobCount: company.Job.length, jobs: company.Job });
                return res.json(response);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Failed to fetch company details",
                });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!adminId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const profile = yield prisma_1.default.admin.findUnique({
                    where: {
                        id: adminId,
                    },
                    select: {
                        id: true,
                        companyName: true,
                        email: true,
                        noHandphone: true,
                        description: true,
                        logo: true,
                        isVerified: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (!profile) {
                    return res.status(404).json({ message: "Profile not found" });
                }
                return res.json(profile);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to fetch profile" });
            }
        });
    }
    updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!adminId) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const { companyName, email, noHandphone, description, city, province } = req.body;
                let logoUrl = undefined;
                const currentProfile = yield prisma_1.default.admin.findUnique({
                    where: { id: adminId },
                    select: { logo: true },
                });
                if (req.file) {
                    try {
                        const uploadResult = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "company-logos");
                        logoUrl = uploadResult.secure_url;
                        if (currentProfile === null || currentProfile === void 0 ? void 0 : currentProfile.logo) {
                            yield (0, cloudinary_1.cloudinaryRemove)(currentProfile.logo);
                        }
                    }
                    catch (error) {
                        return res.status(500).json({ message: "Failed to upload logo" });
                    }
                }
                let location;
                if (city && province) {
                    location = yield prisma_1.default.location.create({
                        data: {
                            city,
                            province,
                            latitude: -6.2,
                            longitude: 106.816666,
                        },
                    });
                    yield prisma_1.default.job.updateMany({
                        where: {
                            adminId: adminId,
                            isActive: true,
                        },
                        data: {
                            locationId: location.id,
                        },
                    });
                }
                const updatedProfile = yield prisma_1.default.admin.update({
                    where: {
                        id: adminId,
                    },
                    data: Object.assign({ companyName,
                        email,
                        noHandphone,
                        description }, (logoUrl && { logo: logoUrl })),
                    include: {
                        Job: {
                            include: {
                                location: true,
                            },
                        },
                    },
                });
                return res.json(updatedProfile);
            }
            catch (error) {
                return res.status(500).json({ message: "Failed to update profile" });
            }
        });
    }
}
exports.CompanyController = CompanyController;
