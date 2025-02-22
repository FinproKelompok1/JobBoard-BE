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
exports.CvController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const puppeteer_1 = __importDefault(require("puppeteer"));
class CvController {
    createCv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { summary, experience, education, skill } = req.body;
                yield prisma_1.default.curriculumVitae.create({
                    data: {
                        userId,
                        summary,
                        experience,
                        education,
                        skill,
                    },
                });
                res.status(201).send({ message: "CV created successfully" });
            }
            catch (error) {
                console.error("Error generating CV:", error);
                res.status(500).send({ message: "Server error: Unable to generate CV." });
            }
        });
    }
    getUserCv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const username = req.params.username;
                const userCv = yield prisma_1.default.user.findUnique({
                    where: { username },
                    select: {
                        fullname: true,
                        email: true,
                        location: { select: { city: true, province: true } },
                        CurriculumVitae: {
                            select: {
                                id: true,
                                summary: true,
                                experience: true,
                                education: true,
                                skill: true,
                            },
                        },
                    },
                });
                res.status(200).send({ userCv });
            }
            catch (error) {
                console.log("Error retrieving user CV:", error);
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve user CV." });
            }
        });
    }
    getCvById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cvId = req.params.cvId;
                const cv = yield prisma_1.default.curriculumVitae.findUnique({
                    where: { id: +cvId },
                    select: {
                        id: true,
                        summary: true,
                        experience: true,
                        education: true,
                        skill: true,
                    },
                });
                res.status(200).send({ cv });
            }
            catch (error) {
                console.error("Error retrieving CV by ID:", error);
                res.status(500).send({ message: "Server error: Unable to retrieve CV." });
            }
        });
    }
    updateCv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cvId = req.params.cvId;
                const { summary, experience, education, skill } = req.body;
                const data = {};
                if (summary !== undefined)
                    data.summary = summary;
                if (experience !== undefined)
                    data.experience = experience;
                if (education !== undefined)
                    data.education = education;
                if (skill !== undefined)
                    data.skill = skill;
                if (Object.keys(data).length === 0) {
                    res.status(400).send({ message: "No fields to update provided" });
                    return;
                }
                yield prisma_1.default.curriculumVitae.update({
                    where: { id: +cvId },
                    data,
                });
                res.status(200).send({ message: `CV updated successfully` });
            }
            catch (error) {
                console.error("Error updating CV:", error);
                res.status(500).send({ message: "Server error: Unable to update CV." });
            }
        });
    }
    downloadCv(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = req.params.username;
            const pageUrl = `${process.env.BASE_URL_FE}/download/cv/${username}`;
            try {
                const browser = yield puppeteer_1.default.launch({ headless: true });
                const page = yield browser.newPage();
                const authToken = req.headers.authorization || "";
                yield page.setExtraHTTPHeaders({
                    Authorization: authToken,
                });
                const authCookie = req.headers.cookie; // Get cookies from the request
                if (authCookie) {
                    const cookies = authCookie.split(";").map((cookie) => {
                        const [name, value] = cookie.trim().split("=");
                        return { name, value, domain: new URL(pageUrl).hostname };
                    });
                    yield page.setCookie(...cookies);
                }
                try {
                    yield page.goto(pageUrl, { waitUntil: "networkidle2" });
                }
                catch (err) {
                    console.error("Failed to load page:", err);
                    res.status(500).send({ message: "Failed to generate CV PDF" });
                    return;
                }
                const pdf = yield page.pdf({
                    format: "A4",
                    printBackground: true,
                    margin: {
                        top: "15mm",
                        right: "20mm",
                        bottom: "15mm",
                        left: "20mm",
                    },
                });
                yield browser.close();
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", `attachment; filename=${username}.pdf`);
                res.setHeader("Content-Length", pdf.length);
                res.status(200).end(pdf);
            }
            catch (error) {
                console.error("Error downloading CV:", error);
                res.status(500).send({ message: "Server error: Unable to download CV." });
            }
        });
    }
}
exports.CvController = CvController;
