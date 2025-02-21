import { Request, Response } from "express";
import { PrismaClient } from "../../../prisma/generated/client";
import { cloudinaryUpload, cloudinaryRemove } from "../../services/cloudinary";
import { AuthUser } from "../../types/auth";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: AuthUser;
  file?: any; // For now we'll use 'any' and fix the type later if needed
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
          Review: true,
          CurriculumVitae: true,
          UserAssessment: {
            include: { certificate: true, assessment: true, User: true },
          },
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
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
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
        // Profile data
        fullname,
        gender,
        dob,
        lastEdu,
        // CV data
        summary,
        experience,
        skill,
        education,
      } = req.body;

      const updatedUser = await prisma.$transaction(async (prisma) => {
        // Update user profile
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            fullname,
            gender,
            dob: dob ? new Date(dob) : undefined,
            lastEdu,
          },
        });

        // First, check if CV exists for this user
        const existingCV = await prisma.curriculumVitae.findFirst({
          where: { userId: userId },
        });

        if (existingCV) {
          // Update existing CV
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
          // Create new CV
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

        // Return updated user with CV
        return prisma.user.findUnique({
          where: { id: userId },
          include: {
            CurriculumVitae: true,
            location: true,
          },
        });
      });

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
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
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  }
}

export default new UserProfileController();
