import { Request, Response } from "express";
import { ApplyService } from "../services/apply.service";
import { AuthUser } from "../types/auth";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
  user?: AuthUser;
}

export class ApplyController {
  private applyService: ApplyService;

  constructor() {
    this.applyService = new ApplyService();
  }

  async applyJob(req: MulterRequest, res: Response) {
    try {
      const jobId = req.params.jobId;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      const resume = req.file;
      if (!resume) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const expectedSalary = parseInt(req.body.expectedSalary);
      if (isNaN(expectedSalary) || expectedSalary <= 0) {
        return res
          .status(400)
          .json({ message: "Valid expected salary is required" });
      }

      const application = await this.applyService.createApplication(
        Number(userId),
        jobId,
        resume,
        expectedSalary
      );

      return res.status(201).json({
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserApplications(req: MulterRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const applications = await this.applyService.getUserApplications(
        Number(userId)
      );
      return res.status(200).json({ data: applications });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getJobApplications(req: MulterRequest, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      const applications = await this.applyService.getJobApplications(jobId);
      return res.status(200).json({ data: applications });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateApplicationStatus(req: MulterRequest, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { jobId } = req.params;
      const { userId, status, rejectedReview } = req.body;

      if (!jobId || !userId || !status) {
        return res
          .status(400)
          .json({ message: "JobId, userId and status are required" });
      }

      const validStatuses = [
        "processed",
        "interviewed",
        "accepted",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const application = await this.applyService.updateStatus(
        Number(userId),
        jobId,
        status,
        rejectedReview
      );

      return res.status(200).json({
        message: "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteApplication(req: MulterRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      await this.applyService.deleteApplication(Number(userId), jobId);
      return res
        .status(200)
        .json({ message: "Application deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getApplicationStatistics(req: MulterRequest, res: Response) {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { jobId } = req.params;
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      const statistics = await this.applyService.getApplicationStatistics(
        jobId
      );
      return res.status(200).json({ data: statistics });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async checkApplication(req: MulterRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { jobId } = req.params;

      if (!userId || !jobId) {
        return res.status(400).json({
          hasApplied: false,
          message: "Unauthorized or invalid job ID",
        });
      }

      const hasApplied = await this.applyService.checkExistingApplication(
        Number(userId),
        jobId
      );

      return res.status(200).json({
        hasApplied,
        message: "Application check successful",
      });
    } catch (error) {
      return res.status(500).json({
        hasApplied: false,
        message: "Internal server error",
      });
    }
  }
}
