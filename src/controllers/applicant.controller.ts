import { Request, Response } from "express";
import prisma from "../prisma";
import { Prisma } from "prisma/generated/client";
import { dateFormatter } from "../helpers/dateFormatter";

export class ApplicantController {
  async getApplicants(req: Request, res: Response) {
    try {
      const limit = 7;
      const {
        sort = "asc",
        page = "1",
        search,
        min_salary,
        max_salary,
        min_age,
        max_age,
        last_edu,
      } = req.query;
      const filter: Prisma.JobApplicationWhereInput = { jobId: req.params.id };

      if (search) {
        filter.user = {
          ...(filter.user as Prisma.UserWhereInput),
          fullname: { contains: search as string, mode: "insensitive" },
        };
      }

      if (min_salary && max_salary) {
        filter.AND = [
          { expectedSalary: { gte: +min_salary } },
          { expectedSalary: { lte: +max_salary } },
        ];
      }

      if (min_age && max_age) {
        const currentDate = new Date();
        const minAge = currentDate.getFullYear() - Number(max_age);
        const maxAge = currentDate.getFullYear() - Number(min_age);

        filter.user = {
          ...(filter.user as Prisma.UserWhereInput),
          AND: [
            {
              dob: {
                lte: dateFormatter(maxAge, currentDate),
              },
            },
            {
              dob: {
                gte: dateFormatter(minAge, currentDate),
              },
            },
          ],
        };
      }

      if (last_edu) {
        filter.user = {
          ...(filter.user as Prisma.UserWhereInput),
          lastEdu: last_edu as Prisma.EnumLastEduNullableFilter,
        };
      }

      const totalApplicants = await prisma.jobApplication.aggregate({
        where: filter,
        _count: { _all: true },
      });
      const totalPage = Math.ceil(totalApplicants._count._all / +limit);

      const applicants = await prisma.jobApplication.findMany({
        where: filter,
        take: limit,
        skip: +limit * (+page - 1),
        orderBy: { createdAt: sort as Prisma.SortOrder },
        select: {
          userId: true,
          createdAt: true,
          expectedSalary: true,
          resume: true,
          status: true,
          rejectedReview: true,
          selectionTestResult: true,
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
      res.status(200).send({ result: { page, totalPage, applicants } });
    } catch (err) {
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
      res
        .status(200)
        .send({ message: "Your applicant status has been updated" });
    } catch (err) {
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
      res.status(400).send(err);
    }
  }

  async setRejectedReview(req: Request, res: Response) {
    try {
      await prisma.jobApplication.update({
        where: {
          userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
        },
        data: { rejectedReview: req.body.rejectedReview },
      });
      res.status(200).send({ message: "Your review has been set" });
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
