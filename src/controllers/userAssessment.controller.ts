import { Request, Response } from "express";
import prisma from "../prisma";

export class UserAssessmentController {
  async createUserAssessment(req: Request, res: Response) {
    try {
      const userId = 1;
      const assessmentId = +req.params.assessmentId;

      const userSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: userId,
          isActive: true,
          subscription: { category: "standard" },
        },
        include: { subscription: true },
      });

      if (userSubscription?.assessmentCount! >= 2)
        throw { message: "You has reached the maximum assessment limit." };

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 30);

      const { id } = await prisma.userAssessment.create({
        data: { userId, assessmentId, endTime },
      });

      await prisma.userSubscription.update({
        where: {
          userId_subscriptionId: {
            userId: userId,
            subscriptionId: userSubscription?.subscriptionId!,
          },
        },
        data: { assessmentCount: { increment: 1 } },
      });

      res.status(201).send({
        userAssessmentId: id,
      });
    } catch (error) {
      res
        .status(500)
        .send(error || "Server error: Unable to create user assessment.");
    }
  }

  async getUserAssessmentById(req: Request, res: Response) {
    try {
      const userAssessmentId = +req.params.userAssessmentId;

      const userAssessment = await prisma.userAssessment.findUnique({
        where: { id: userAssessmentId },
        include: {
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
          User: true,
        },
      });

      res.status(200).send({ userAssessment });
    } catch (error) {
      console.error("Error retrieving user assessment by ID:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve user assessment." });
    }
  }
}
