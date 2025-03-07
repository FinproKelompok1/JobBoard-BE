import { Request, Response } from "express";
import { PrismaClient } from "../../../prisma/generated/client";
import { cloudinaryUpload, cloudinaryRemove } from "../../services/cloudinary";
import { AuthUser } from "../../types/auth";
import { EmailService } from "../../services/email.service";
import jwt from "jsonwebtoken";
import axios from "axios";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const emailService = new EmailService();

interface AuthRequest extends Request {
  user?: AuthUser;
  file?: any;
}

export class UserProfileController {
  async getUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          CurriculumVitae: true,
          location: true,
          JobApplication: {
            include: {
              job: {
                include: {
                  admin: true,
                },
              },
            },
          },
          Interview: true,
          Review: true,
          UserSubscription: true,
          UserAssessment: {
            include: { certificate: true, assessment: true, User: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const enhancedApplications = user.JobApplication.map((application) => {
        const interviewData = user.Interview.find(
          (interview) => interview.jobId === application.jobId
        );

        return {
          ...application,
          interview: interviewData,
        };
      });

      const enhancedUser = {
        ...user,
        JobApplication: enhancedApplications,
      };

      res.status(200).json({
        success: true,
        data: enhancedUser,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUserProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const currentUserId = req.user?.id;

      if (!currentUserId || currentUserId !== userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const {
        fullname,
        gender,
        dob,
        lastEdu,
        province,
        city,
        summary,
        experience,
        skill,
        education,
      } = req.body;

      const updatedUser = await prisma.$transaction(async (prisma) => {
        let location = await prisma.location.findFirst({
          where: {
            AND: [{ city }, { province }],
          },
        });

        if (!location && city && province) {
          try {
            const query = `${city}+${province}+Indonesia`;
            const { data } = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                query
              )}&key=bcf87dd591a44c57b21a10bed03f5daa`
            );

            if (!data.results || data.results.length === 0) {
              throw new Error("No location data found");
            }

            const { lat, lng } = data.results[0].geometry;
            location = await prisma.location.create({
              data: {
                city,
                province,
                latitude: parseFloat(lat.toString()),
                longitude: parseFloat(lng.toString()),
              },
            });
          } catch (error) {
            location = await prisma.location.create({
              data: {
                city,
                province,
                latitude: 0,
                longitude: 0,
              },
            });
          }
        }

        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            fullname,
            gender,
            dob: dob ? new Date(dob) : undefined,
            lastEdu,
            domicileId: location?.id || null,
          },
          include: {
            location: true,
            CurriculumVitae: true,
          },
        });

        if (summary || experience || skill || education) {
          const existingCV = await prisma.curriculumVitae.findFirst({
            where: { userId: userId },
          });

          if (existingCV) {
            await prisma.curriculumVitae.update({
              where: { id: existingCV.id },
              data: {
                summary: summary || "",
                experience: experience || "",
                skill: skill || "",
                education: education || "",
              },
            });
          } else {
            await prisma.curriculumVitae.create({
              data: {
                userId: userId,
                summary: summary || "",
                experience: experience || "",
                skill: skill || "",
                education: education || "",
              },
            });
          }
        }

        return prisma.user.findUnique({
          where: { id: userId },
          include: {
            location: true,
            CurriculumVitae: true,
          },
        });
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  }

  async uploadProfileImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (
        currentUser?.avatar &&
        !currentUser.avatar.includes("Default_idtsln.png")
      ) {
        await cloudinaryRemove(currentUser.avatar);
      }

      const result = await cloudinaryUpload(req.file, "profile-images");

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: result.secure_url },
        select: {
          id: true,
          avatar: true,
        },
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image" });
    }
  }

  async changeEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { newEmail, password } = req.body;

      if (!newEmail || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existingUser) {
        res.status(400).json({ message: "Email is already in use" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      const token = jwt.sign(
        {
          userId,
          newEmail,
          type: "email_change",
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      await emailService.sendEmailChangeVerification(
        newEmail,
        token,
        user.fullname || user.username
      );

      res.status(200).json({
        success: true,
        message:
          "Verification email sent. Please check your new email to complete the change.",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to change email" });
    }
  }

  async verifyEmailChange(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        res.status(400).json({ message: "Invalid token" });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: number;
        newEmail: string;
        type: string;
      };

      if (decoded.type !== "email_change") {
        res.status(400).json({ message: "Invalid token type" });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          email: decoded.newEmail,
          isVerified: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Email changed successfully",
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(400).json({ message: "Token has expired" });
        return;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({ message: "Invalid token" });
        return;
      }
      res.status(500).json({ message: "Failed to verify email change" });
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res
          .status(400)
          .json({ message: "Both current and new password are required" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  }

  async takeJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await prisma.jobApplication.update({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
        data: {
          isTaken: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Job successfully taken",
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to take job" });
    }
  }

  async isProfileComplete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          gender: true,
          dob: true,
          lastEdu: true,
          domicileId: true,
          location: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isComplete = Boolean(
        user.gender && user.dob && user.lastEdu && user.domicileId
      );

      const missingFields = {
        gender: !user.gender,
        dob: !user.dob,
        lastEdu: !user.lastEdu,
        domicileId: !user.domicileId,
      };

      res.status(200).json({
        success: true,
        data: {
          isComplete,
          missingFields,
          locationInfo: user.location,
        },
      });
    } catch (error) {
      console.error("Error checking profile completion:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default new UserProfileController();
