import { Request, Response } from "express";
import prisma from "../prisma";

export class CompanyController {
  async getCompanies(req: Request, res: Response) {
    console.log("CompanyController: getCompanies called");
    try {
      const allAdmins = await prisma.admin.findMany();
      console.log("All admins in database:", allAdmins);

      const companies = await prisma.admin.findMany({
        where: {
          isVerified: true,
        },
        select: {
          id: true,
          companyName: true,
          logo: true,
          description: true,
          _count: {
            select: {
              Job: {
                where: {
                  isActive: true,
                  isPublished: true,
                },
              },
            },
          },
        },
      });

      const formattedCompanies = companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
        logo: company.logo,
        description: company.description,
        jobCount: company._count.Job,
      }));

      console.log("Sending response:", formattedCompanies);
      return res.status(200).json(formattedCompanies);
    } catch (error) {
      console.error("Error in getCompanies:", error);
      return res.status(500).json({
        message: "Failed to fetch companies",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = parseInt(id);

      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await prisma.admin.findUnique({
        where: {
          id: companyId,
        },
        select: {
          id: true,
          companyName: true,
          email: true, // Tambahkan email
          noHandphone: true, // Tambahkan noHandphone
          description: true,
          logo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          Job: {
            where: {
              isActive: true,
              isPublished: true,
            },
            include: {
              location: true,
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Format response
      const response = {
        ...company,
        jobCount: company.Job.length,
        jobs: company.Job, // Rename Job to jobs for frontend consistency
      };

      return res.json(response);
    } catch (error) {
      console.error("Error in getCompanyById:", error);
      return res
        .status(500)
        .json({ message: "Failed to fetch company details" });
    }
  }
}
