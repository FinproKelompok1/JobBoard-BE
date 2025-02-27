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
exports.JobController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const cloudinary_1 = require("../services/cloudinary");
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../../prisma/generated/client");
class JobController {
    getJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const limit = 7;
                const { sort = "asc", page = "1", search } = req.query;
                const filter = {
                    AND: [{ adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id }, { isActive: true }],
                };
                if (search) {
                    const isEnumValid = Object.values(client_1.JobCategory).includes(search);
                    filter.OR = [
                        { title: { contains: search, mode: "insensitive" } },
                        ...(isEnumValid ? [{ category: search }] : []),
                    ];
                }
                const totalJobs = yield prisma_1.default.job.aggregate({
                    where: filter,
                    _count: { _all: true },
                });
                const totalPage = Math.ceil(totalJobs._count._all / +limit);
                const jobs = yield prisma_1.default.job.findMany({
                    where: filter,
                    take: limit,
                    skip: +limit * (+page - 1),
                    include: {
                        location: { select: { city: true, province: true } },
                    },
                    orderBy: { createdAt: sort },
                });
                res.status(200).send({ result: { page, totalPage, jobs } });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    createJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (req.file) {
                    const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "jobsBanner");
                    req.body.banner = secure_url;
                }
                let location = yield prisma_1.default.location.findFirst({
                    where: { city: req.body.city },
                });
                if (!location) {
                    const { data } = yield axios_1.default.get(`https://api.opencagedata.com/geocode/v1/json?q=${req.body.city
                        .split(" ")
                        .join("+")}+${req.body.province
                        .split(" ")
                        .join("+")}&key=bcf87dd591a44c57b21a10bed03f5daa`);
                    const { geometry } = data.results[0];
                    location = yield prisma_1.default.location.create({
                        data: {
                            city: req.body.city,
                            province: req.body.province,
                            latitude: geometry.lat,
                            longitude: geometry.lng,
                        },
                    });
                }
                if (req.body.salary) {
                    req.body.salary = Number(req.body.salary);
                }
                req.body.tags = req.body.tags.trim().split(",");
                delete req.body.city;
                delete req.body.province;
                yield prisma_1.default.job.create({
                    data: Object.assign(Object.assign({}, req.body), { adminId, locationId: location.id }),
                });
                res.status(200).send({ message: "Your job has been added" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    getJobDetail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const job = yield prisma_1.default.job.findUnique({
                    where: { id: req.params.id },
                    select: {
                        title: true,
                        role: true,
                        banner: true,
                        endDate: true,
                        salary: true,
                        category: true,
                        description: true,
                        tags: true,
                        location: { select: { city: true, province: true } },
                    },
                });
                res.status(200).send({ result: job });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    jobEdit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (req.file) {
                    const { secure_url } = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "jobsBanner");
                    req.body.banner = secure_url;
                }
                if (req.body.salary) {
                    req.body.salary = Number(req.body.salary);
                }
                if (req.body.location) {
                    let location = yield prisma_1.default.location.findFirst({
                        where: { city: req.body.city },
                    });
                    if (!location) {
                        const { data } = yield axios_1.default.get(`https://api.opencagedata.com/geocode/v1/json?q=${req.body.city
                            .split(" ")
                            .join("+")}+${req.body.province
                            .split(" ")
                            .join("+")}&key=bcf87dd591a44c57b21a10bed03f5daa`);
                        const { geometry } = data.results[0];
                        location = yield prisma_1.default.location.create({
                            data: {
                                city: req.body.city,
                                province: req.body.province,
                                latitude: geometry.lat,
                                longitude: geometry.lng,
                            },
                        });
                    }
                    delete req.body.city;
                    delete req.body.province;
                }
                if (req.body.tags) {
                    req.body.tags = req.body.tags.trim().split(",");
                }
                yield prisma_1.default.job.update({ data: req.body, where: { id: req.params.id } });
                res.status(200).send({ message: "your job jas been edited" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    deleteJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.job.update({
                    where: { id: req.params.id },
                    data: { isActive: false },
                });
                res.status(200).send({ message: "Your job has been deleted" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    setPublishJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { isPublished } = req.body;
                yield prisma_1.default.job.update({
                    where: { id: req.params.id },
                    data: { isPublished },
                });
                res.status(200).send({
                    message: `Your job has been ${isPublished ? "published" : "unpublished"}`,
                });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    totalJobs(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const jobs = yield prisma_1.default.job.aggregate({
                    where: { adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, isActive: true },
                    _count: { _all: true },
                });
                res.status(200).send({ result: jobs._count._all });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
}
exports.JobController = JobController;
