import { Request, Response } from "express";
import prisma from "../prisma";
import { JobCategory, Prisma } from "../../prisma/generated/client";

export class JobDiscoveryController {
  async discoverJobs(req: Request, res: Response) {
    try {
      const {
        city,
        province,
        search,
        searchTerm,
        category,
        page = "1",
        limit = "6",
        sort = "createdAt",
        order = "desc",
      } = req.query;

      // Gunakan searchTerm jika search tidak ada
      const searchQuery = search || searchTerm;

      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);

      if (
        isNaN(pageNumber) ||
        isNaN(limitNumber) ||
        pageNumber < 1 ||
        limitNumber < 1
      ) {
        return res.status(400).json({
          message: "Invalid pagination parameters",
        });
      }

      const skip = (pageNumber - 1) * limitNumber;

      const whereClause: any = {
        isActive: true,
        isPublished: true,
      };

      if (city) {
        whereClause.location = {
          city: city as string,
        };

        if (province) {
          whereClause.location.province = province as string;
        }
      }

      if (searchQuery) {
        whereClause.OR = [
          { title: { contains: searchQuery as string, mode: "insensitive" } },
          { role: { contains: searchQuery as string, mode: "insensitive" } },
          {
            description: {
              contains: searchQuery as string,
              mode: "insensitive",
            },
          },
        ];
      }

      if (category) {
        whereClause.category = category as string;
      }

      const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "salary",
        "title",
        "role",
      ];
      const sortField = allowedSortFields.includes(sort as string)
        ? (sort as string)
        : "createdAt";

      const sortOrder =
        (order as string)?.toLowerCase() === "asc" ? "asc" : "desc";

      const orderBy: any = {};
      orderBy[sortField] = sortOrder;

      const totalCount = await prisma.job.count({ where: whereClause });

      const jobs = await prisma.job.findMany({
        where: whereClause,
        include: {
          location: true,
          admin: {
            select: {
              companyName: true,
              logo: true,
              description: true,
            },
          },
        },
        orderBy: orderBy,
        skip: skip,
        take: limitNumber,
      });

      const totalPages = Math.ceil(totalCount / limitNumber);

      return res.status(200).json({
        result: jobs,
        pagination: {
          currentPage: pageNumber,
          totalPages: totalPages,
          totalItems: totalCount,
          itemsPerPage: limitNumber,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
        debug: {
          totalJobs: totalCount,
          matchingJobs: jobs.length,
          queryParams: {
            city,
            province,
            searchQuery,
            category,
            page,
            limit,
            sort,
            order,
          },
          appliedSort: { field: sortField, direction: sortOrder },
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch jobs",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: {
          id: id,
          isActive: true,
        },
        include: {
          location: true,
          admin: {
            select: {
              companyName: true,
              logo: true,
              description: true,
            },
          },
        },
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      return res.status(200).json({ result: job });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch job details" });
    }
  }

  async getRelatedJobs(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const currentJob = await prisma.job.findUnique({
        where: { id },
        select: {
          adminId: true,
          role: true,
          category: true,
        },
      });

      if (!currentJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      const relatedJobs = await prisma.job.findMany({
        where: {
          isActive: true,
          isPublished: true,
          id: { not: id },
          OR: [
            { adminId: currentJob.adminId },
            {
              AND: [
                { role: currentJob.role },
                { category: currentJob.category },
              ],
            },
          ],
        },
        include: {
          location: true,
          admin: {
            select: {
              companyName: true,
              logo: true,
              description: true,
            },
          },
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({ result: relatedJobs });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch related jobs" });
    }
  }

  async getCompanyDetails(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await prisma.admin.findUnique({
        where: {
          id: id,
        },
        include: {
          Job: {
            where: {
              isActive: true,
              isPublished: true,
            },
            include: {
              location: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      return res.status(200).json(company);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Failed to fetch company details" });
    }
  }
}
