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
exports.ReviewController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class ReviewController {
    createReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const jobId = req.params.jobId;
                const { review, CultureRating, balanceRating, facilityRating, careerRating, salary, } = req.body;
                const userJob = yield prisma_1.default.jobApplication.findUnique({
                    where: { userId_jobId: { userId, jobId } },
                    select: { isTaken: true },
                });
                if (!(userJob === null || userJob === void 0 ? void 0 : userJob.isTaken)) {
                    res.status(400).send({ message: "User does not work at this company" });
                    return;
                }
                const isReviewed = yield prisma_1.default.review.findUnique({
                    where: { userId_jobId: { userId, jobId } },
                });
                if (isReviewed) {
                    res.status(400).send({ message: "User have reviewed this company" });
                    return;
                }
                yield prisma_1.default.review.create({
                    data: {
                        userId,
                        jobId,
                        review,
                        CultureRating,
                        balanceRating,
                        facilityRating,
                        careerRating,
                        salary,
                    },
                });
                res.status(201).send({ message: "Review submitted successfully" });
            }
            catch (error) {
                console.error("Error creating review:", error);
                res
                    .status(500)
                    .send({ message: "Server error: Unable to create review." });
            }
        });
    }
    getUserReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const jobId = req.params.jobId;
                const userReview = yield prisma_1.default.review.findUnique({
                    where: { userId_jobId: { userId, jobId } },
                });
                res.status(200).send({ userReview });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to get user review" });
            }
        });
    }
    getCompanyReviews(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = +req.params.adminId;
                const company = yield prisma_1.default.admin.findUnique({
                    where: { id: adminId },
                    select: {
                        companyName: true,
                        Job: {
                            select: {
                                Review: true,
                                title: true,
                            },
                        },
                    },
                });
                const companyReviews = (company === null || company === void 0 ? void 0 : company.Job.flatMap((job) => job.Review.map((review) => (Object.assign(Object.assign({}, review), { jobTitle: job.title }))))) || [];
                res.status(200).send({
                    companyReviews,
                    companyName: company === null || company === void 0 ? void 0 : company.companyName,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to get company reviews" });
            }
        });
    }
}
exports.ReviewController = ReviewController;
