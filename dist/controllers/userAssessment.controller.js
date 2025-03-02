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
exports.UserAssessmentController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const chromium_1 = __importDefault(require("@sparticuz/chromium"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
class UserAssessmentController {
    createUserAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw { message: "User ID is required." };
                }
                const { assessmentId } = req.body;
                const userSubscription = yield prisma_1.default.userSubscription.findFirst({
                    where: {
                        userId: userId,
                        isActive: true,
                    },
                    include: { subscription: true },
                });
                if (!userSubscription) {
                    throw { message: "No active standard subscription found." };
                }
                const subscriptionCategory = userSubscription.subscription.category;
                if (subscriptionCategory === "standard" &&
                    userSubscription.assessmentCount >= 2) {
                    throw {
                        message: "You have reached the maximum assessment limit for a Standard subscription.",
                    };
                }
                const endTime = new Date();
                endTime.setMinutes(endTime.getMinutes() + 30);
                const { id } = yield prisma_1.default.userAssessment.create({
                    data: { userId, assessmentId, endTime },
                });
                yield prisma_1.default.userSubscription.update({
                    where: {
                        userId_subscriptionId: {
                            userId: userId,
                            subscriptionId: userSubscription.subscriptionId,
                        },
                    },
                    data: { assessmentCount: { increment: 1 } },
                });
                res.status(201).send({
                    userAssessmentId: id,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .send(error || "Server error: Unable to create user assessment.");
            }
        });
    }
    getUserAssessments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.params.username;
                const user = yield prisma_1.default.user.findUnique({
                    where: { username: username },
                    select: { id: true },
                });
                const userAssessments = yield prisma_1.default.userAssessment.findMany({
                    where: { userId: user === null || user === void 0 ? void 0 : user.id },
                    include: {
                        User: true,
                        certificate: true,
                        assessment: {
                            select: {
                                title: true,
                                AssessmentQuestion: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctAnswer: true,
                                    },
                                },
                            },
                        },
                    },
                });
                res.status(200).send({ userAssessments });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve user assessments.",
                });
            }
        });
    }
    getUserAssessmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAssessmentId = +req.params.userAssessmentId;
                const userAssessment = yield prisma_1.default.userAssessment.findUnique({
                    where: { id: userAssessmentId },
                    include: {
                        User: true,
                        certificate: true,
                        assessment: {
                            select: {
                                title: true,
                                AssessmentQuestion: {
                                    select: {
                                        id: true,
                                        question: true,
                                        options: true,
                                        correctAnswer: true,
                                    },
                                },
                            },
                        },
                    },
                });
                res.status(200).send({ userAssessment });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve user assessment." });
            }
        });
    }
    updateUserAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userAssessmentId = +req.params.userAssessmentId;
                const { score } = req.body;
                yield prisma_1.default.userAssessment.update({
                    where: { id: userAssessmentId },
                    data: { score: score, status: score >= 75 ? "passed" : "failed" },
                });
                if (score >= 75) {
                    const userAssessment = yield prisma_1.default.userAssessment.findUnique({
                        where: { id: userAssessmentId },
                        include: { User: true, assessment: true },
                    });
                    const assessmentTitle = userAssessment === null || userAssessment === void 0 ? void 0 : userAssessment.assessment.title.toLocaleLowerCase().replace(/\s+/g, "-");
                    const { id } = yield prisma_1.default.certificate.create({
                        data: {
                            CertificateUrl: `${process.env.BASE_URL_FE}/certificate/${assessmentTitle}/${userAssessment === null || userAssessment === void 0 ? void 0 : userAssessment.User.username}`,
                            badgeName: `${userAssessment === null || userAssessment === void 0 ? void 0 : userAssessment.assessment.title}`,
                            badgeIcon: "https://res.cloudinary.com/difaukz1b/image/upload/v1739762156/icon/emjf6oektw1l6cywhvpu.png",
                        },
                    });
                    yield prisma_1.default.userAssessment.update({
                        where: { id: userAssessmentId },
                        data: { certificateId: id },
                    });
                }
                res.status(200).send({
                    message: "User assessment updated successfully",
                });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to update user assessment." });
            }
        });
    }
    downloadCertificate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            const userAssessmentId = req.params.userAssessmentId;
            const pageUrl = `${process.env.BASE_URL_FE}/download/assessment/${username}/${userAssessmentId}/certificate`;
            try {
                console.log("🔍 Checking Chromium Path...");
                const executablePath = yield chromium_1.default.executablePath();
                console.log("✅ Chromium Path:", executablePath);
                if (!executablePath) {
                    console.error("❌ Error: Chromium executablePath is undefined!");
                    res.status(500).send({ message: "Chromium not found!" });
                    return;
                }
                // ✅ Modify Puppeteer launch settings for cloud deployment
                const browser = yield puppeteer_core_1.default.launch({
                    args: [...chromium_1.default.args, "--no-sandbox", "--disable-gpu"],
                    defaultViewport: chromium_1.default.defaultViewport,
                    executablePath,
                    headless: chromium_1.default.headless === "true" || true, // Ensure headless mode
                });
                console.log("✅ Puppeteer Launched");
                const page = yield browser.newPage();
                const authToken = req.headers.authorization || "";
                yield page.setExtraHTTPHeaders({ Authorization: authToken });
                // ✅ Pass cookies if present
                const authCookie = req.headers.cookie;
                if (authCookie) {
                    const cookies = authCookie.split(";").map((cookie) => {
                        const [name, value] = cookie.trim().split("=");
                        return { name, value, domain: new URL(pageUrl).hostname };
                    });
                    yield page.setCookie(...cookies);
                }
                // ✅ Navigate to the certificate page
                yield page.goto(pageUrl, { waitUntil: "networkidle2" });
                // ✅ Generate and return the PDF
                const pdf = yield page.pdf({
                    format: "a4",
                    printBackground: true,
                    landscape: true,
                });
                yield browser.close();
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=${username}-certificate.pdf`);
                res.setHeader("Content-Length", pdf.length);
                res.status(200).end(pdf);
            }
            catch (error) {
                console.error("❌ Certificate Download Error:", error);
                res.status(500).send({ message: "Failed to download certificate" });
            }
        });
    }
}
exports.UserAssessmentController = UserAssessmentController;
