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
exports.ApplicantController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const dateFormatter_1 = require("../helpers/dateFormatter");
class ApplicantController {
    getApplicants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = 7;
                const { sort = "asc", page = "1", search, min_salary, max_salary, min_age, max_age, last_edu, } = req.query;
                console.log(req.query);
                const filter = { jobId: req.params.id };
                if (search) {
                    filter.user = Object.assign(Object.assign({}, filter.user), { fullname: { contains: search, mode: "insensitive" } });
                }
                if (min_salary && max_salary) {
                    filter.AND = [
                        { expectedSalary: { gte: +min_salary } },
                        { expectedSalary: { lte: +max_salary } },
                    ];
                }
                if (min_age && max_age) {
                    const currentDate = new Date();
                    const minAge = currentDate.getFullYear() - Number(max_age);
                    const maxAge = currentDate.getFullYear() - Number(min_age);
                    filter.user = Object.assign(Object.assign({}, filter.user), { AND: [
                            {
                                dob: {
                                    lte: (0, dateFormatter_1.dateFormatter)(maxAge, currentDate),
                                },
                            },
                            {
                                dob: {
                                    gte: (0, dateFormatter_1.dateFormatter)(minAge, currentDate),
                                },
                            },
                        ] });
                }
                if (last_edu) {
                    filter.user = Object.assign(Object.assign({}, filter.user), { lastEdu: last_edu });
                }
                const totalApplicants = yield prisma_1.default.jobApplication.aggregate({
                    where: filter,
                    _count: { _all: true },
                });
                const totalPage = Math.ceil(totalApplicants._count._all / +limit);
                const applicants = yield prisma_1.default.jobApplication.findMany({
                    where: filter,
                    take: limit,
                    skip: +limit * (+page - 1),
                    orderBy: { createdAt: sort },
                    select: {
                        userId: true,
                        createdAt: true,
                        expectedSalary: true,
                        resume: true,
                        status: true,
                        rejectedReview: true,
                        user: {
                            select: {
                                avatar: true,
                                fullname: true,
                                email: true,
                                dob: true,
                                lastEdu: true,
                            },
                        },
                    },
                });
                res.status(200).send({ result: { page, totalPage, applicants } });
            }
            catch (err) {
                console.log(err);
                res.status(200).send(err);
            }
        });
    }
    setApplicantStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, jobId, status } = req.body;
                console.log(req.body);
                yield prisma_1.default.jobApplication.update({
                    where: {
                        userId_jobId: {
                            userId,
                            jobId,
                        },
                    },
                    data: { status },
                });
                res
                    .status(200)
                    .send({ message: "Your applicant status has been updated" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getTotalApplicants(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const total = yield prisma_1.default.jobApplication.aggregate({
                    where: {
                        jobId: req.params.id,
                    },
                    _count: { _all: true },
                });
                res.status(200).send({ result: total._count._all });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    setRejectedReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.jobApplication.update({
                    where: {
                        userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
                    },
                    data: { rejectedReview: req.body.rejectedReview },
                });
                res.status(200).send({ message: "Your review has been set" });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.ApplicantController = ApplicantController;
