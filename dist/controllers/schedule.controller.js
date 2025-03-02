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
exports.ScheduleController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const mailer_1 = require("../services/mailer");
const dateFormatter_1 = require("../helpers/dateFormatter");
const timeFormatter_1 = require("../helpers/timeFormatter");
class ScheduleController {
    getApplicantSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = yield prisma_1.default.interview.findFirst({
                    where: {
                        AND: [{ jobId: req.body.jobId }, { userId: req.body.userId }],
                    },
                    select: { startTime: true },
                });
                res.status(200).send({ result: startTime });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    createSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { jobId, userId, startTime } = req.body;
                yield prisma_1.default.interview.create({ data: { jobId, userId, startTime } });
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: { email: true, fullname: true },
                });
                const job = yield prisma_1.default.job.findUnique({
                    where: { id: jobId },
                    select: { title: true, admin: { select: { companyName: true } } },
                });
                const templatePath = path_1.default.join(__dirname, "../templates", "interviewSchedule.html");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({
                    applicant_name: user === null || user === void 0 ? void 0 : user.fullname,
                    job_title: job === null || job === void 0 ? void 0 : job.title,
                    company_name: job === null || job === void 0 ? void 0 : job.admin.companyName,
                    date: (0, dateFormatter_1.formatDate)(startTime),
                    time: (0, timeFormatter_1.formatTime)(startTime),
                });
                yield mailer_1.transporter.sendMail({
                    from: "Talent Bridge",
                    to: user === null || user === void 0 ? void 0 : user.email,
                    subject: `Exciting Opportunity! Interview Scheduled for ${job === null || job === void 0 ? void 0 : job.title}`,
                    html,
                });
                res.status(200).send({ message: "Your schedule has been set" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    updateSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const oldTime = yield prisma_1.default.interview.findUnique({
                    where: {
                        userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
                    },
                    select: { startTime: true },
                });
                yield prisma_1.default.interview.update({
                    where: {
                        userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
                    },
                    data: { startTime: req.body.startTime },
                });
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: req.body.userId },
                    select: { email: true, fullname: true },
                });
                const job = yield prisma_1.default.job.findUnique({
                    where: { id: req.body.jobId },
                    select: { title: true, admin: { select: { companyName: true } } },
                });
                const templatePath = path_1.default.join(__dirname, "../templates", "interviewReschedule.html");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({
                    applicant_name: user === null || user === void 0 ? void 0 : user.fullname,
                    job_title: job === null || job === void 0 ? void 0 : job.title,
                    company_name: job === null || job === void 0 ? void 0 : job.admin.companyName,
                    previous_date: (0, dateFormatter_1.formatDate)(`${oldTime === null || oldTime === void 0 ? void 0 : oldTime.startTime}`),
                    previous_time: (0, timeFormatter_1.formatTime)(`${oldTime === null || oldTime === void 0 ? void 0 : oldTime.startTime}`),
                    new_date: (0, dateFormatter_1.formatDate)(req.body.startTime),
                    new_time: (0, timeFormatter_1.formatTime)(req.body.startTime),
                });
                yield mailer_1.transporter.sendMail({
                    from: "Talent Bridge",
                    to: user === null || user === void 0 ? void 0 : user.email,
                    subject: "Interview Rescheduled - New Date & Time for Your Interview",
                    html,
                });
                res.status(200).send({ message: "Your interview has been rescheduled" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    deleteSchedule(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.default.interview.delete({
                    where: {
                        userId_jobId: {
                            userId: Number(req.query.userId),
                            jobId: req.query.jobId,
                        },
                    },
                });
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: Number(req.query.userId) },
                    select: { email: true, fullname: true },
                });
                const job = yield prisma_1.default.job.findUnique({
                    where: { id: req.query.jobId },
                    select: { title: true, admin: { select: { companyName: true } } },
                });
                const templatePath = path_1.default.join(__dirname, "../templates", "interviewDeleted.html");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compiledTemplate = handlebars_1.default.compile(templateSource);
                const html = compiledTemplate({
                    applicant_name: user === null || user === void 0 ? void 0 : user.fullname,
                    job_title: job === null || job === void 0 ? void 0 : job.title,
                    company_name: job === null || job === void 0 ? void 0 : job.admin.companyName,
                });
                yield mailer_1.transporter.sendMail({
                    from: "Talent Bridge",
                    to: user === null || user === void 0 ? void 0 : user.email,
                    subject: "Interview Update - Unfortunately!",
                    html,
                });
                res.status(200).send({ message: "Your schedule has been deleted" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
}
exports.ScheduleController = ScheduleController;
