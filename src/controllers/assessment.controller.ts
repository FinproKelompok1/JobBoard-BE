import { Request, Response } from "express";
import prisma from "../prisma";

export class AssessmentController {
  async createAssessment(req: Request, res: Response) {
    try {
      const { title, description } = req.body;

      const { id } = await prisma.assessment.create({
        data: {
          title,
          description,
        },
      });

      res
        .status(201)
        .send({ message: "Assessment created successfully", assessmentId: id });
    } catch (error) {
      console.error("Error creating assessment:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to create assessment." });
    }
  }

  async getAssessment(req: Request, res: Response) {
    try {
      const assessments = await prisma.assessment.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          isActive: true,
          AssessmentQuestion: { select: { question: true } },
        },
      });

      res.status(200).send({ assessments });
    } catch (error) {
      console.error("Error retrieving assessments:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve assessments." });
    }
  }

  async getAssessmentById(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId;

      const assessment = await prisma.assessment.findUnique({
        where: { id: +assessmentId },
        select: { id: true, title: true, description: true, isActive: true },
      });

      res.status(200).send({ assessment });
    } catch (error) {
      console.error("Error retrieving assessments:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve assessments." });
    }
  }

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

  async getAssessmentQuestion(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 5;
      const skip = (page - 1) * limit;

      const totalQuestions = await prisma.assessmentQuestion.count({
        where: { assessmentId: +assessmentId },
      });

      const questions = await prisma.assessmentQuestion.findMany({
        where: { assessmentId: +assessmentId },
        skip: skip,
        take: limit,
      });

      const totalPages = Math.ceil(totalQuestions / limit);

      res.status(200).send({
        questions,
        totalQuestions,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error("Error retrieving questions:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve questions." });
    }
  }

  async switchAssessmentStatus(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId;
      const { isActive } = req.body;

      await prisma.assessment.update({
        where: { id: +assessmentId },
        data: { isActive },
      });
      res
        .status(200)
        .send({ message: "Assessment status updated successfully" });
    } catch (error) {
      console.error("Error updating assessment status:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to update assessment status." });
    }
  }
}
