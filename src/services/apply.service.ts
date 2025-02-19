// src/services/apply.service.ts
import { PrismaClient, JobApplication } from "../../prisma/generated/client";
import { cloudinaryUpload } from "./cloudinary";

const prisma = new PrismaClient();

export class ApplyService {
  async createApplication(
    userId: number,
    jobId: string,
    resume: Express.Multer.File,
    expectedSalary: number
  ): Promise<JobApplication> {
    try {
      // Check for existing application
      const existingApplication = await prisma.jobApplication.findUnique({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });

      if (existingApplication) {
        throw new Error("You have already applied for this job");
      }

      // Verify job status
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        throw new Error("Job not found");
      }
      if (!job.isActive) {
        throw new Error("This job is no longer accepting applications");
      }
      if (new Date() > job.endDate) {
        throw new Error("The application deadline has passed");
      }

      // Upload resume to cloudinary
      const uploadResult = await cloudinaryUpload(resume, "resumes");

      // Create application
      return await prisma.jobApplication.create({
        data: {
          userId,
          jobId,
          resume: uploadResult.secure_url,
          expectedSalary,
          isTaken: false,
          status: "processed",
        },
      });
    } catch (error) {
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
      throw error;
    }
  }
}
