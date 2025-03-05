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
exports.interviewReminder = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = __importDefault(require("../prisma"));
const reminderEmail_1 = require("./reminderEmail");
const dateFormatter_1 = require("../helpers/dateFormatter");
const timeFormatter_1 = require("../helpers/timeFormatter");
const interviewReminder = () => __awaiter(void 0, void 0, void 0, function* () {
    const startOfTomorrow = (0, dayjs_1.default)().add(1, "day").startOf("day").toDate();
    const endOfTomorrow = (0, dayjs_1.default)().add(1, "day").endOf("day").toDate();
    try {
        const interviewRemindered = yield prisma_1.default.interview.findMany({
            where: {
                startTime: {
                    gte: startOfTomorrow,
                    lt: endOfTomorrow,
                },
            },
            select: {
                startTime: true,
                user: {
                    select: {
                        fullname: true,
                        email: true,
                    },
                },
                job: {
                    select: {
                        title: true,
                        admin: {
                            select: {
                                companyName: true,
                            },
                        },
                    },
                },
            },
        });
        for (const interview of interviewRemindered) {
            try {
                yield (0, reminderEmail_1.sendRemainderEmail)({
                    email: interview.user.email,
                    applicant_name: interview.user.fullname,
                    job_title: interview.job.title,
                    company_name: interview.job.admin.companyName,
                    date: (0, dateFormatter_1.formatDate)(`${interview.startTime}`),
                    time: (0, timeFormatter_1.formatTime)(`${interview.startTime}`),
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    catch (err) {
        console.error("schedule", err);
    }
});
exports.interviewReminder = interviewReminder;
