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
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const resume = req.file;
      if (!resume) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const expectedSalary = parseInt(req.body.expectedSalary);
      if (!expectedSalary) {
        return res.status(400).json({ message: "Expected salary is required" });
      }

      const application = await this.applyService.createApplication(
        userId,
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

      const applications = await this.applyService.getUserApplications(userId);
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

      const application = await this.applyService.updateStatus(
        userId,
        jobId,
        status,
        rejectedReview
      );

      return res.status(200).json({
        message: "Application status updated successfully",
        data: application,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
