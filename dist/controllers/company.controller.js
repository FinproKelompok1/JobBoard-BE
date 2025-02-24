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
class CompanyController {
    getCompanies(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("CompanyController: getCompanies called");
            try {
                const allAdmins = yield prisma_1.default.admin.findMany();
                const companies = yield prisma_1.default.admin.findMany({
                    where: {
                        isVerified: true,
                    },
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
                    },
                });
                const formattedCompanies = companies.map((company) => ({
                    id: company.id,
                    companyName: company.companyName,
                    logo: company.logo,
                    description: company.description,
                    jobCount: company._count.Job,
                }));
                return res.status(200).json(formattedCompanies);
            }
            catch (error) {
                console.error("Error in getCompanies:", error);
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
                        email: true, // Tambahkan email
                        noHandphone: true, // Tambahkan noHandphone
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
                // Format response
                const response = Object.assign(Object.assign({}, company), { jobCount: company.Job.length, jobs: company.Job });
                return res.json(response);
            }
            catch (error) {
                console.error("Error in getCompanyById:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to fetch company details" });
            }
        });
    }
}
exports.CompanyController = CompanyController;
