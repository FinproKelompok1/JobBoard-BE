import { Request, Response } from "express";
import prisma from "../prisma";

export class AnalyticController {
  async getTotalDemographics(req: Request, res: Response) {
    try {
      const gender = await prisma.user.groupBy({
        by: ["gender"],
        _count: { _all: true },
        where: { JobApplication: { some: {} } },
      });

      const age = await prisma.$queryRaw<{ age: number; total: number }[]>`
        SELECT
          EXTRACT(YEAR FROM AGE(u.dob)) AS age,
          CAST(COUNT(*) AS INT) AS total
        FROM "User" AS u
        WHERE EXISTS (
          SELECT 1 FROM "JobApplication" AS j WHERE j."userId" = u."id"
        )
        GROUP BY age
        ORDER BY age;
      `;

      const location = await prisma.$queryRaw<
        { city: string; total: number }[]
      >`
        SELECT l.city, CAST(COUNT(*) AS INT) AS total
        FROM "User" u
        JOIN "Location" l ON u."domicileId" = l."id"
        WHERE EXISTS (
          SELECT 1 FROM "JobApplication" j WHERE j."userId" = u."id"
        )
        GROUP BY l.city
        ORDER BY total DESC;
      `;

      res.status(200).send({
        result: {
          age,
          gender: [
            { total: gender[0]._count._all, type: gender[0].gender },
            { total: gender[1]._count._all, type: gender[1].gender },
          ],
          location,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getSalaryTrends(req: Request, res: Response) {
    try {
      const basedOnJobRole = await prisma.$queryRaw<
        { role: string; avgSalary: number }[]
      >`
        SELECT j.role, AVG(r.salary) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        GROUP BY j.role
        ORDER BY avgSalary DESC;
      `;

      const basedOnJobLocation = await prisma.$queryRaw<
        { city: string; avgSalary: number }[]
      >`
        SELECT l.city, AVG(r.salary) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        JOIN "Location" l ON j."locationId" = l."id"
        GROUP BY l.city
        ORDER BY avgSalary DESC;
      `;

      res.status(200).send({ result: { basedOnJobRole, basedOnJobLocation } });
    } catch (err) {
      console.log(err);
      res.status(200).send(err);
    }
  }

  async getApplicantInterest(req: Request, res: Response) {
    try {
      const basedOnJobCategory = await prisma.$queryRaw<
        {
          category: string;
          total: number;
        }[]
      >`
        SELECT j.category, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        GROUP BY j.category
        ORDER BY total DESC
      `;

      res.status(200).send({ result: { basedOnJobCategory } });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
