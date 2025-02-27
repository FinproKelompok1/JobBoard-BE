import { Request, Response } from "express";
import prisma from "../prisma";
import { cloudinaryUpload, cloudinaryRemove } from "../services/cloudinary";
import { AuthUser } from "../types/auth";

interface CustomRequest extends Request {
  user?: AuthUser;
  file?: any;
}

export class CompanyController {
  async getCompanies(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const totalCompanies = await prisma.admin.count({
        where: {
          isVerified: true,
        },
      });

      const totalPages = Math.ceil(totalCompanies / limit);

      const companies = await prisma.admin.findMany({
        where: {
          isVerified: true,
        },
        skip: skip,
        take: limit,
        select: {
          id: true,
          companyName: true,
          logo: true,
          description: true,
          _count: {
            select: {
              Job: {
                where: {
                  isActive: true,
                  isPublished: true,
                },
              },
            },
          },
          Job: {
            where: {
              isActive: true,
              isPublished: true,
            },
            select: {
              location: {
                select: {
                  city: true,
                  province: true,
                },
              },
            },
          },
        },
      });

      const formattedCompanies = companies.map((company) => ({
        id: company.id,
        companyName: company.companyName,
        logo: company.logo,
        description: company.description,
        jobCount: company._count.Job,
        Job: company.Job.map((job) => ({
          location: job.location,
        })),
      }));

      return res.status(200).json({
        data: formattedCompanies,
        meta: {
          page,
          limit,
          totalItems: totalCompanies,
          totalPages,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch companies",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
  async getCompanyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = parseInt(id);

      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const company = await prisma.admin.findUnique({
        where: {
          id: companyId,
        },
        select: {
          id: true,
          companyName: true,
          email: true,
          noHandphone: true,
          description: true,
          logo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          Job: {
            where: {
              isActive: true,
              isPublished: true,
            },
            include: {
              location: true,
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      const response = {
        ...company,
        jobCount: company.Job.length,
        jobs: company.Job,
      };

      return res.json(response);
    } catch (error) {
      return res.status(500).json({
        message: "Failed to fetch company details",
      });
    }
  }

  async getProfile(req: CustomRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await prisma.admin.findUnique({
        where: {
          id: adminId,
        },
        select: {
          id: true,
          companyName: true,
          email: true,
          noHandphone: true,
          description: true,
          logo: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      return res.json(profile);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch profile" });
    }
  }

  async updateProfile(req: CustomRequest, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { companyName, email, noHandphone, description, city, province } =
        req.body;
      let logoUrl = undefined;

      const currentProfile = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { logo: true },
      });

      if (req.file) {
        try {
          const uploadResult = await cloudinaryUpload(
            req.file,
            "company-logos"
          );
          logoUrl = uploadResult.secure_url;

          if (currentProfile?.logo) {
            await cloudinaryRemove(currentProfile.logo);
          }
        } catch (error) {
          return res.status(500).json({ message: "Failed to upload logo" });
        }
      }

      let location;
      if (city && province) {
        location = await prisma.location.create({
          data: {
            city,
            province,
            latitude: -6.2,
            longitude: 106.816666,
          },
        });

        await prisma.job.updateMany({
          where: {
            adminId: adminId,
            isActive: true,
          },
          data: {
            locationId: location.id,
          },
        });
      }

      const updatedProfile = await prisma.admin.update({
        where: {
          id: adminId,
        },
        data: {
          companyName,
          email,
          noHandphone,
          description,
          ...(logoUrl && { logo: logoUrl }),
        },
        include: {
          Job: {
            include: {
              location: true,
            },
          },
        },
      });

      return res.json(updatedProfile);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update profile" });
    }
  }
}
