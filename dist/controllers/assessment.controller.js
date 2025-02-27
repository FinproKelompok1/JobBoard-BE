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
exports.AssessmentController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AssessmentController {
    createAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description } = req.body;
                const { id } = yield prisma_1.default.assessment.create({
                    data: {
                        title,
                        description,
                    },
                });
                res
                    .status(201)
                    .send({ message: "Assessment created successfully", assessmentId: id });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to create assessment." });
            }
        });
    }
    getAssessment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessments = yield prisma_1.default.assessment.findMany({
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        isActive: true,
                        AssessmentQuestion: { select: { question: true } },
                        UserAssessment: {
                            select: {
                                User: { select: { username: true } },
                                status: true,
                                id: true,
                            },
                        },
                    },
                });
                res.status(200).send({ assessments });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve assessments." });
            }
        });
    }
    getAssessmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.assessmentId;
                const assessment = yield prisma_1.default.assessment.findUnique({
                    where: { id: +assessmentId },
                });
                res.status(200).send({ assessment });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve assessments." });
            }
        });
    }
    getAssessmentQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.assessmentId;
                const totalQuestions = yield prisma_1.default.assessmentQuestion.count({
                    where: { assessmentId: +assessmentId },
                });
                const assessmentQuestions = yield prisma_1.default.assessmentQuestion.findMany({
                    where: { assessmentId: +assessmentId },
                });
                res.status(200).send({
                    assessmentQuestions,
                    totalQuestions,
                });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to retrieve questions." });
            }
        });
    }
    switchAssessmentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.assessmentId;
                const { isActive } = req.body;
                yield prisma_1.default.assessment.update({
                    where: { id: +assessmentId },
                    data: { isActive },
                });
                res
                    .status(200)
                    .send({ message: "Assessment status updated successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to update assessment status." });
            }
        });
    }
}
exports.AssessmentController = AssessmentController;
