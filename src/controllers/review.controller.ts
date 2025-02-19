import { Request, Response } from "express";
import prisma from "../prisma";

export class ReviewController {
  async createReview(req: Request, res: Response) {
    try {
      const userId = +req.params.userId;
      const jobId = req.params.jobId;

      const {
        review,
        CultureRating,
        balanceRating,
        facilityRating,
        careerRating,
        salary,
      } = req.body;

      const userJob = await prisma.jobApplication.findUnique({
        where: { userId_jobId: { userId, jobId } },
        select: { isTaken: true },
      });

      if (!userJob?.isTaken) {
        res.status(400).send({ message: "User does not work at this company" });
        return;
      }

      const isReviewed = await prisma.review.findUnique({
        where: { userId_jobId: { userId, jobId } },
      });

      if (isReviewed) {
        res.status(400).send({ message: "User have reviewed this company" });
        return;
      }

      await prisma.review.create({
        data: {
          userId,
          jobId,
          review,
          CultureRating,
          balanceRating,
          facilityRating,
          careerRating,
          salary,
        },
      });

      res.status(201).send({ message: "Review created successfully" });
    } catch (error) {
      console.error("Error creating review:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to create review." });
    }
  }
}

// model Review {
//     userId         Int
//     jobId          String
//     review         String
//     CultureRating  Int
//     balanceRating  Int
//     facilityRating Int
//     careerRating   Int
//     salary         Int
//     createdAt      DateTime @default(now())
//     user           User     @relation(fields: [userId], references: [id])
//     job            Job      @relation(fields: [jobId], references: [id])

//     @@id([userId, jobId])
//   }
