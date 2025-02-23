import { Request, Response } from "express";
import prisma from "../prisma";
import { cloudinaryUpload } from "../services/cloudinary";
import axios from "axios";
import { JobCategory, Prisma } from "../../prisma/generated/client";

export class JobController {
  async getJobs(req: Request, res: Response) {
    try {
      const limit = 7;
      const { sort = "asc", page = "1", search } = req.query;
      const filter: Prisma.JobWhereInput = {
        AND: [{ adminId: req.user?.id }, { isActive: true }],
      };
      if (search) {
        const isEnumValid = Object.values(JobCategory).includes(
          search as JobCategory
        );
        filter.OR = [
          { title: { contains: search as string, mode: "insensitive" } },
          ...(isEnumValid ? [{ category: search as JobCategory }] : []),
        ];
      }
      const totalJobs = await prisma.job.aggregate({
        where: filter,
        _count: { _all: true },
      });
      const totalPage = Math.ceil(totalJobs._count._all / +limit);
      const jobs = await prisma.job.findMany({
        where: filter,
        take: limit,
        skip: +limit * (+page - 1),
        include: {
          location: { select: { city: true, province: true } },
        },
        orderBy: { createdAt: sort as Prisma.SortOrder },
      });
      res.status(200).send({ result: { page, totalPage, jobs } });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createJob(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      if (req.file) {
        const { secure_url } = await cloudinaryUpload(req.file, "jobsBanner");
        req.body.banner = secure_url;
      }
      let location = await prisma.location.findFirst({
        where: { city: req.body.city },
      });
      if (!location) {
        const { data } = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${req.body.city
            .split(" ")
            .join("+")}+${req.body.province
            .split(" ")
            .join("+")}&key=bcf87dd591a44c57b21a10bed03f5daa`
        );
        const { geometry } = data.results[0];
        location = await prisma.location.create({
          data: {
            city: req.body.city,
            province: req.body.province,
            latitude: geometry.lat,
            longitude: geometry.lng,
          },
        });
      }
      if (req.body.salary) {
        req.body.salary = Number(req.body.salary);
      }
      req.body.tags = req.body.tags.trim().split(",");
      delete req.body.city;
      delete req.body.province;
      await prisma.job.create({
        data: { ...req.body, adminId, locationId: location.id },
      });
      res.status(200).send({ message: "Your job has been added" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getJobDetail(req: Request, res: Response) {
    try {
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
        select: {
          title: true,
          role: true,
          banner: true,
          endDate: true,
          salary: true,
          category: true,
          description: true,
          tags: true,
          location: { select: { city: true, province: true } },
        },
      });
      res.status(200).send({ result: job });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async jobEdit(req: Request, res: Response) {
    try {
      if (req.file) {
        const { secure_url } = await cloudinaryUpload(req.file, "jobsBanner");
        req.body.banner = secure_url;
      }
      if (req.body.salary) {
        req.body.salary = Number(req.body.salary);
      }
      if (req.body.location) {
        let location = await prisma.location.findFirst({
          where: { city: req.body.city },
        });
        if (!location) {
          const { data } = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${req.body.city
              .split(" ")
              .join("+")}+${req.body.province
              .split(" ")
              .join("+")}&key=bcf87dd591a44c57b21a10bed03f5daa`
          );
          const { geometry } = data.results[0];
          location = await prisma.location.create({
            data: {
              city: req.body.city,
              province: req.body.province,
              latitude: geometry.lat,
              longitude: geometry.lng,
            },
          });
        }
        delete req.body.city;
        delete req.body.province;
      }
      if (req.body.tags) {
        req.body.tags = req.body.tags.trim().split(",");
      }
      await prisma.job.update({ data: req.body, where: { id: req.params.id } });
      res.status(200).send({ message: "your job jas been edited" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async deleteJob(req: Request, res: Response) {
    try {
      await prisma.job.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
      res.status(200).send({ message: "Your job has been deleted" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async setPublishJob(req: Request, res: Response) {
    try {
      const { isPublished } = req.body;
      await prisma.job.update({
        where: { id: req.params.id },
        data: { isPublished },
      });
      res.status(200).send({
        message: `Your job has been ${
          isPublished ? "published" : "unpublished"
        }`,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async totalJobs(req: Request, res: Response) {
    try {
      const jobs = await prisma.job.aggregate({
        where: { adminId: req.user?.id, isActive: true },
        _count: { _all: true },
      });
      res.status(200).send({ result: jobs._count._all });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}