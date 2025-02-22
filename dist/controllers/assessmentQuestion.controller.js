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
exports.AssessmentQuestionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AssessmentQuestionController {
    createAssessmentQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentId = req.params.assessmentId;
                const { question, options, correctAnswer } = req.body;
                const optionsArray = options.map((option) => option.trim());
                const correctAnswerIndex = "abcd".indexOf(correctAnswer.toLowerCase());
                yield prisma_1.default.assessmentQuestion.create({
                    data: {
                        assessmentId: +assessmentId,
                        question,
                        options: optionsArray,
                        correctAnswer: correctAnswerIndex,
                    },
                });
                res.status(201).send({ message: "Question created successfully" });
            }
            catch (error) {
                console.error("Error creating question:", error);
                res
                    .status(500)
                    .send({ message: "Server error: Unable to create question." });
            }
        });
    }
    editAssessmentQuestion(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assessmentQuestionId = req.params.assessmentQuestionId;
                const { question, options, correctAnswer } = req.body;
                const data = {};
                if (question !== undefined)
                    data.question = question;
                if (options !== undefined)
                    data.options = options;
                if (correctAnswer !== undefined)
                    data.correctAnswer = "abcd".indexOf(correctAnswer.toLowerCase());
                if (Object.keys(data).length === 0) {
                    res.status(400).send({ message: "No fields to update provided" });
                    return;
                }
                yield prisma_1.default.assessmentQuestion.update({
                    where: { id: +assessmentQuestionId },
                    data,
                });
                res.status(200).send({
                    message: `Assessment question ID ${assessmentQuestionId} updated successfully`,
                });
            }
            catch (error) {
                console.error("Error updating assessment question:", error);
                res.status(500).send({
                    message: "Server error: Unable to assessment question.",
                });
            }
        });
    }
}
exports.AssessmentQuestionController = AssessmentQuestionController;
