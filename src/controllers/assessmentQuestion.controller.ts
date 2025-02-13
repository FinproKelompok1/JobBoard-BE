import { Request, Response } from "express";
import prisma from "../prisma";

export class AssessmentQuestionController {
  async createAssessmentQuestion(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId;
      const { question, options, correctAnswer } = req.body;

      const optionsArray: string[] = options.map((option: string) =>
        option.trim()
      );

      const correctAnswerIndex = "abcd".indexOf(correctAnswer.toLowerCase());

      await prisma.assessmentQuestion.create({
        data: {
          assessmentId: +assessmentId,
          question,
          options: optionsArray,
          correctAnswer: correctAnswerIndex,
        },
      });

      res.status(201).send({ message: "Question created successfully" });
    } catch (error) {
      console.error("Error creating question:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to create question." });
    }
  }

  async getAssessmentQuestionById(req: Request, res: Response) {
    try {
      const assessmentQuestionId = req.params.assessmentQuestionId;
      const assessmentQuestion = await prisma.assessmentQuestion.findUnique({
        where: { id: +assessmentQuestionId },
      });

      res.status(200).send({ assessmentQuestion });
    } catch (error) {
      console.error("Error retrieving question by ID:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve question by ID." });
    }
  }

  async editAssessmentQuestion(req: Request, res: Response) {
    try {
      const assessmentQuestionId = req.params.assessmentQuestionId;
      const { question, options, correctAnswer } = req.body;

      const data: {
        question?: string;
        options?: string[];
        correctAnswer?: number;
      } = {};

      if (question !== undefined) data.question = question;
      if (options !== undefined) data.options = options;
      if (correctAnswer !== undefined)
        data.correctAnswer = "abcd".indexOf(correctAnswer.toLowerCase());

      if (Object.keys(data).length === 0) {
        res.status(400).send({ message: "No fields to update provided" });
        return;
      }

      await prisma.assessmentQuestion.update({
        where: { id: +assessmentQuestionId },
        data,
      });

      res.status(200).send({
        message: `Assessment question ID ${assessmentQuestionId} updated successfully`,
      });
    } catch (error) {
      console.error("Error updating assessment question:", error);
      res.status(500).send({
        message: "Server error: Unable to assessment question.",
      });
    }
  }

  async deleteAssessmentQuestion(req: Request, res: Response) {
    try {
      const assessmentQuestionId = req.params.assessmentQuestionId;

      await prisma.subscription.delete({
        where: { id: +assessmentQuestionId },
      });

      res.status(200).send({
        message: `Subscription ID ${assessmentQuestionId} deleted successfully`,
      });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).send({
        message: "Server error: Unable to delete subscription.",
      });
    }
  }
}
