import { Request, Response } from "express";
import prisma from "../prisma";

export class ApplicantController {
  async getApplicants(req: Request, res: Response) {
    try {
      const applicants = await prisma.jobApplication.findMany({
        where: {
          jobId: req.params.id,
        },
        select: {
          createdAt: true,
          expectedSalary: true,
          resume: true,
          status: true,
          user: {
            select: {
              avatar: true,
              fullname: true,
              email: true,
              dob: true,
              lastEdu: true,
            },
          },
        },
      });
      res.status(200).send({ result: applicants });
    } catch (err) {
      console.log(err);
      res.status(200).send(err);
    }
  }

  async setApplicantStatus(req: Request, res: Response) {
    try {
      const { userId, jobId, status } = req.body;
      await prisma.jobApplication.update({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
        data: { status },
      });
      res.status(200).send({ message: "Your applicant data has been updated" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getTotalApplicants(req: Request, res: Response) {
    try {
      const total = await prisma.jobApplication.aggregate({
        where: {
          jobId: req.params.id,
        },
        _count: { _all: true },
      });
      res.status(200).send({ result: total._count._all });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
