import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthUser } from "../types/auth";

interface MulterRequest extends Request {
  user?: AuthUser;
}

export class ReviewController {
  async createReview(req: MulterRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id!;
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

      res.status(201).send({ message: "Review submitted successfully" });
    } catch (error) {
      console.error("Error creating review:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to create review." });
    }
  }

  async getUserReview(req: MulterRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id!;
      const jobId = req.params.jobId;

      const userReview = await prisma.review.findUnique({
        where: { userId_jobId: { userId, jobId } },
      });

      res.status(200).send({ userReview });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to get user review" });
    }
  }

  async getCompanyReviews(req: MulterRequest, res: Response): Promise<void> {
    try {
      const adminId = +req.params.adminId;

      const company = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          companyName: true,
          Job: {
            select: {
              Review: true,
              title: true,
            },
          },
        },
      });

      const companyReviews =
        company?.Job.flatMap((job) =>
          job.Review.map((review) => ({
            ...review,
            jobTitle: job.title,
          }))
        ) || [];
      res.status(200).send({
        companyReviews,
        companyName: company?.companyName,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to get company reviews" });
    }
  }
}
