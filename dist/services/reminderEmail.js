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
exports.sendRemainderEmail = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
const mailer_1 = require("./mailer");
const sendRemainderEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, applicant_name, job_title, company_name, date, time, }) {
    const templatePath = path_1.default.join(__dirname, "../templates", "interviewReminder.html");
    const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars_1.default.compile(templateSource);
    const html = compiledTemplate({
        applicant_name,
        job_title,
        company_name,
        date,
        time,
    });
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Upcoming Interview Reminder - Don't Be Late!",
        html,
    };
    try {
        yield mailer_1.transporter.sendMail(mailOptions);
    }
    catch (err) {
        console.log(`Error`, err);
    }
});
exports.sendRemainderEmail = sendRemainderEmail;
