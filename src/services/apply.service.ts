import { PrismaClient, JobApplication } from "../../prisma/generated/client";
import { cloudinaryUpload } from "./cloudinary";

export class ApplyService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createApplication(
    userId: number,
    jobId: string,
    resume: Express.Multer.File,
    expectedSalary: number
  ): Promise<JobApplication> {
    try {
      const existingApplication = await this.prisma.jobApplication.findFirst({
        where: {
          userId,
          jobId,
        },
      });

      if (existingApplication) {
        throw new Error("You have already applied for this job");
      }

      const job = await this.prisma.job.findUnique({
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

      const uploadResult = await cloudinaryUpload(resume, "resumes");

      const application = await this.prisma.$transaction(async (tx) => {
        return tx.jobApplication.create({
          data: {
            userId,
            jobId,
            resume: uploadResult.secure_url,
            expectedSalary,
            isTaken: false,
            status: "processed",
          },
          include: {
            job: {
              select: {
                title: true,
                admin: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        });
      });

      return application;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to create application");
    }
  }

  async getUserApplications(userId: number): Promise<JobApplication[]> {
    try {
      return await this.prisma.jobApplication.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              admin: {
                select: {
                  companyName: true,
                  logo: true,
                },
              },
              location: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      throw new Error("Failed to fetch user applications");
    }
  }

  async destroy() {
    await this.prisma.$disconnect();
  }
}
