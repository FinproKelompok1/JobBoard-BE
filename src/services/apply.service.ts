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
      // Debug log untuk input
      console.log("Attempting to create application:", {
        userId,
        jobId,
        salary: expectedSalary,
      });

      // Cek job validity
      const job = await prisma.job.findUnique({
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

      // Cek existing application dengan Query yang lebih spesifik
      const applications = await prisma.jobApplication.findMany({
        where: {
          userId: userId,
        },
        select: {
          jobId: true,
        },
      });

      // Debug log untuk applications
      console.log("Existing applications for user:", applications);

      const hasApplied = applications.some((app) => app.jobId === jobId);

      // Debug log untuk hasil pengecekan
      console.log("Application check result:", {
        hasApplied,
        checkingJobId: jobId,
      });

      if (hasApplied) {
        throw new Error("You have already applied for this job");
      }

      // Proses upload dan create application
      const uploadResult = await cloudinaryUpload(resume, "resumes");

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
