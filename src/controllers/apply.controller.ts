import { Request, Response } from "express";
import { ApplyService } from "../services/apply.service";

interface AuthUser {
  id: number;
  role: "user" | "admin" | "developer";
}

interface RequestWithAuth extends Request {
  user?: AuthUser;
}

export class ApplyController {
  private applyService: ApplyService;

  constructor() {
    this.applyService = new ApplyService();
  }

  async applyJob(req: RequestWithAuth, res: Response) {
    try {
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId || !jobId) {
        return res.status(400).json({
          message: "User ID and Job ID are required",
        });
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
        userId,
        jobId,
        resume,
        expectedSalary
      );

      return res.status(201).json({
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error: any) {
      console.error("Application submission error:", error);
      return res.status(error.status || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }

  async getUserApplications(req: RequestWithAuth, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const applications = await this.applyService.getUserApplications(userId);
      return res.status(200).json({
        message: "Applications retrieved successfully",
        data: applications,
      });
    } catch (error: any) {
      console.error("Get user applications error:", error);
      return res.status(error.status || 500).json({
        message: error.message || "Internal server error",
      });
    }
  }
}
