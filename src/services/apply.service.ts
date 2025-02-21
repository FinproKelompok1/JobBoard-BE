import { PrismaClient, JobApplication } from "../../prisma/generated/client";
import { cloudinaryUpload } from "./cloudinary";
import { Request } from "express";
import { Multer } from "multer";

const prisma = new PrismaClient();

export class ApplyService {
  async createApplication(
    userId: number,
    jobId: string,
    resume: Express.Multer.File,
    expectedSalary: number
  ): Promise<JobApplication> {
    try {
      console.log("Service received:", {
        userId,
        jobId,
        resumeName: resume.originalname,
        salary: expectedSalary,
      });

      // Validate all required fields
      if (!userId || !jobId || !resume || !expectedSalary) {
        throw new Error("All fields are required");
      }

      // Check if job exists and is active
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          isActive: true,
        },
        select: {
          id: true,
          endDate: true,
          title: true,
        },
      });

      if (!job) {
        throw new Error("Job not found or not active");
      }

      if (new Date() > job.endDate) {
        throw new Error("The application deadline has passed");
      }

      // Check for existing application using findFirst
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          AND: [{ userId: userId }, { jobId: jobId }],
        },
      });

      if (existingApplication) {
        throw new Error("You have already applied for this job");
      }

      // Upload resume
      const uploadResult = await cloudinaryUpload(resume, "resumes");

      // Create application
      const newApplication = await prisma.jobApplication.create({
        data: {
          userId: userId,
          jobId: jobId,
          resume: uploadResult.secure_url,
          expectedSalary: expectedSalary,
          isTaken: false,
          status: "processed",
        },
      });

      return newApplication;
    } catch (error) {
      console.error("Application creation error:", error);
      throw error;
    }
  }

  async getUserApplications(userId: number): Promise<JobApplication[]> {
    try {
      return await prisma.jobApplication.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              admin: true,
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error("Error fetching user applications:", error);
      throw error;
    }
  }

  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    try {
      return await prisma.jobApplication.findMany({
        where: { jobId },
        include: {
          user: {
            select: {
              id: true,
              fullname: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      console.error("Error fetching job applications:", error);
      throw error;
    }
  }

  async updateStatus(
    userId: number,
    jobId: string,
    status: "processed" | "interviewed" | "accepted" | "rejected",
    rejectedReview?: string
  ): Promise<JobApplication> {
    try {
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          AND: [{ userId: userId }, { jobId: jobId }],
        },
      });

      if (!existingApplication) {
        throw new Error("Application not found");
      }

      return await prisma.jobApplication.update({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
        data: {
          status,
          rejectedReview,
        },
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  }

  async deleteApplication(
    userId: number,
    jobId: string
  ): Promise<JobApplication> {
    try {
      const existingApplication = await prisma.jobApplication.findFirst({
        where: {
          AND: [{ userId: userId }, { jobId: jobId }],
        },
      });

      if (!existingApplication) {
        throw new Error("Application not found");
      }

      return await prisma.jobApplication.delete({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      throw error;
    }
  }

  async getApplicationStatistics(jobId: string): Promise<{
    total: number;
    processed: number;
    interviewed: number;
    accepted: number;
    rejected: number;
  }> {
    try {
      const applications = await prisma.jobApplication.findMany({
        where: { jobId },
        select: {
          status: true,
        },
      });

      const statistics = {
        total: applications.length,
        processed: applications.filter((app) => app.status === "processed")
          .length,
        interviewed: applications.filter((app) => app.status === "interviewed")
          .length,
        accepted: applications.filter((app) => app.status === "accepted")
          .length,
        rejected: applications.filter((app) => app.status === "rejected")
          .length,
      };

      return statistics;
    } catch (error) {
      console.error("Error getting application statistics:", error);
      throw error;
    }
  }

  async checkExistingApplication(
    userId: number,
    jobId: string
  ): Promise<boolean> {
    try {
      const application = await prisma.jobApplication.findFirst({
        where: {
          AND: [{ userId: userId }, { jobId: jobId }],
        },
      });

      return !!application;
    } catch (error) {
      console.error("Error checking application:", error);
      throw error;
    }
  }
}
