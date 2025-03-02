import { Request, Response } from "express";
import prisma from "../prisma";

export class AnalyticController {
  async getTotalDemographics(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const gender = await prisma.$queryRaw<{ type: string; total: number }[]>`
        SELECT u."gender" AS "type", CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY "type"
      `;

      const ageRaw = await prisma.$queryRaw<{ age: number; total: number }[]>`
        SELECT
          EXTRACT(YEAR FROM AGE(u.dob)) AS age,
          CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" AS ja
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY age
      `;
      const formattedAge = [
        { age: "<18", total: 0 },
        { age: "18-25", total: 0 },
        { age: "26-32", total: 0 },
        { age: "33-40", total: 0 },
        { age: "40<", total: 0 },
      ];
      for (const item of ageRaw) {
        const { age, total } = item;
        if (age < 18) {
          formattedAge[0].total += total;
        } else if (age >= 18 && age <= 25) {
          formattedAge[1].total += total;
        } else if (age >= 26 && age <= 32) {
          formattedAge[2].total += total;
        } else if (age >= 33 && age <= 40) {
          formattedAge[3].total += total;
        } else {
          formattedAge[4].total += total;
        }
      }

      const location = await prisma.$queryRaw<
        { city: string; total: number }[]
      >`
        SELECT l.city, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Location" l ON u."domicileId" = l."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY l.city
      `;

      const education = await prisma.$queryRaw<
        {
          education: string;
          total: number;
          avgSalary: number;
        }[]
      >`
        SELECT u."lastEdu" AS education, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY u."lastEdu"
      `;

      res.status(200).send({
        result: {
          age: formattedAge,
          gender,
          location,
          education,
        },
      });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async getSalaryTrends(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const basedOnJobRole = await prisma.$queryRaw<
        { role: string; avgSalary: number }[]
      >`
        SELECT j.role, CAST(AVG(r.salary) AS INT) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY j.role
      `;

      const basedOnJobLocation = await prisma.$queryRaw<
        { city: string; avgSalary: number }[]
      >`
        SELECT l.city, CAST(AVG(r.salary) AS INT) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        JOIN "Location" l ON j."locationId" = l."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY l.city
      `;

      res.status(200).send({ result: { basedOnJobRole, basedOnJobLocation } });
    } catch (err) {
      res.status(200).send(err);
    }
  }

  async getApplicantInterest(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      const basedOnJobCategory = await prisma.$queryRaw<
        {
          category: string;
          total: number;
        }[]
      >`
        SELECT j.category, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY j.category
      `;

      const basedOnExpectedSalary = await prisma.$queryRaw<
        {
          category: string;
          avgSalary: number;
        }[]
      >`
        SELECT j.category, CAST(AVG(ja."expectedSalary") AS INT) AS avgSalary
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId} AND j."isActive" = true
        GROUP BY j.category
      `;

      res
        .status(200)
        .send({ result: { basedOnJobCategory, basedOnExpectedSalary } });
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
