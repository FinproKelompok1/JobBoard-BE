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
exports.sendInvoiceEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const handlebars_1 = __importDefault(require("handlebars"));
dotenv_1.default.config();
const transaporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
const sendInvoiceEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, username, fullname, }) {
    const link = `${process.env.BASE_URL_FE}/${username}/subscription`;
    const templatePath = path_1.default.join(__dirname, "../templates", "invoiceEmail.hbs");
    const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars_1.default.compile(templateSource);
    const html = compiledTemplate({ fullname, username, link });
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Subscription Renewal Invoice",
        html: html,
    };
    try {
        yield transaporter.sendMail(mailOptions);
    }
    catch (error) {
        console.log(`Error sending invoice to ${email}: ${error}`);
    }
});
exports.sendInvoiceEmail = sendInvoiceEmail;
