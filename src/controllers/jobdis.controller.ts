import { Request, Response } from "express";
import prisma from "../prisma";
import { JobCategory, Prisma } from "../../prisma/generated/client";

export class JobDiscoveryController {
  async discoverJobs(req: Request, res: Response) {
    try {
      const { city, province } = req.query;
      console.log("Received query params:", { city, province });

      const allJobs = await prisma.job.findMany({
        include: {
          location: true,
        },
      });
      console.log("All jobs in database:", allJobs);

      const jobsWithLocation = await prisma.job.findMany({
        where: {
          location: {
            city: city as string,
          },
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
      console.log("Jobs matching location:", jobsWithLocation);

      const locations = await prisma.location.findMany({
        where: {
          city: city as string,
        },
      });
      console.log("Matching locations:", locations);

      return res.status(200).json({
        result: jobsWithLocation,
        debug: {
          totalJobs: allJobs.length,
          matchingJobs: jobsWithLocation.length,
          matchingLocations: locations.length,
          queryParams: { city, province },
        },
      });
    } catch (error) {
      console.error("Error in discoverJobs:", error);
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
      console.error("Error in getJobById:", error);
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
      });

      return res.status(200).json({ result: relatedJobs });
    } catch (error) {
      console.error("Error in getRelatedJobs:", error);
      return res.status(500).json({ message: "Failed to fetch related jobs" });
    }
  }
}
