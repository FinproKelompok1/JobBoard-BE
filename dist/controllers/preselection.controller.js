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
exports.PreselectionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class PreselectionController {
    getPreselection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const preselection = yield prisma_1.default.preSelectionTest.findFirst({
                    where: { jobId: req.params.id },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                    },
                });
                res.status(200).send({ result: preselection });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    getPreselectionQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const questions = yield prisma_1.default.selectionTestQuestion.findMany({
                    where: {
                        preSelectionTest: { jobId: req.params.id },
                    },
                });
                res.status(200).send({ result: questions });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    submitPreselection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { answer } = req.body;
                let totalCorrectAnswer = 0;
                for (const item of answer) {
                    if (item.selectedOption == item.correctAnswer) {
                        totalCorrectAnswer++;
                    }
                }
                const selectionTestResult = (totalCorrectAnswer / answer.length) * 100;
                yield prisma_1.default.jobApplication.update({
                    where: {
                        userId_jobId: { jobId: req.params.id, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                    },
                    data: { selectionTestResult },
                });
                res
                    .status(200)
                    .send({ message: "Thank you, your answers was submitted" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    createPreselection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { title, description, jobId } = req.body;
                const { id: preSelectionTestId } = yield prisma_1.default.preSelectionTest.create({
                    data: { title, description, jobId },
                });
                const formattedQuestions = req.body.preselectionQuestions.map((question) => (Object.assign(Object.assign({}, question), { preSelectionTestId })));
                yield prisma_1.default.selectionTestQuestion.createMany({
                    data: formattedQuestions,
                });
                res.status(200).send({ message: "Test successfully created" });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
    setActiveTest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { isTestActive } = req.body;
                yield prisma_1.default.job.update({
                    where: { id: req.params.id },
                    data: { isTestActive },
                });
                res.status(200).send({
                    isThereTest: true,
                    message: `Your job test has been ${isTestActive ? "activated" : "unactivated"}`,
                });
            }
            catch (err) {
                res.status(400).send(err);
            }
        });
    }
}
exports.PreselectionController = PreselectionController;
