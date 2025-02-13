import { Request, Response } from "express";
import prisma from "../prisma";

export class UserAssessmentController {
  async createUserAssessment(req: Request, res: Response) {
    try {
      const userId = 1;
      const assessmentId = +req.params.assessmentId;

      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 30);

      const { id } = await prisma.userAssessment.create({
        data: { userId, assessmentId, endTime },
      });

      res.status(201).send({
        message: "User assessment created successfully",
        userAssessmentId: id,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to create user assessment." });
    }
  }

  async getUserAssessmentById(req: Request, res: Response) {
    try {
      const userAssessmentId = +req.params.userAssessmentId;

      const userAssessment = await prisma.userAssessment.findUnique({
        where: { id: userAssessmentId },
        include: {
          assessment: true,
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
