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
    } catch (error) {
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
      });

      res.status(200).send({ assessment });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve assessments." });
    }
  }

  async getAssessmentQuestion(req: Request, res: Response) {
    try {
      const assessmentId = req.params.assessmentId;

      const totalQuestions = await prisma.assessmentQuestion.count({
        where: { assessmentId: +assessmentId },
      });

      const assessmentQuestions = await prisma.assessmentQuestion.findMany({
        where: { assessmentId: +assessmentId },
      });

      res.status(200).send({
        assessmentQuestions,
        totalQuestions,
      });
    } catch (error) {
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
      res
        .status(500)
        .send({ message: "Server error: Unable to update assessment status." });
    }
  }
}
