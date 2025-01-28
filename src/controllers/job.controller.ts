import { Request, Response } from "express";
import prisma from "../prisma";
import { cloudinaryUpload } from "../services/cloudinary";
import axios from "axios";

export class JobController {
  async getJobs(req: Request, res: Response) {
    try {
      const jobs = await prisma.job.findMany({ where: { adminId: 1 } });
      res.status(200).send({ result: jobs });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createJob(req: Request, res: Response) {
    try {
      const adminId = 1;
      if (req.file) {
        const { secure_url } = await cloudinaryUpload(req.file, "jobsBanner");
        req.body.banner = secure_url;
      }

      let location = await prisma.location.findFirst({
        where: { location: req.body.city },
      });
      if (!location) {
        const { data } = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json?q=${req.body.city
            .split(" ")
            .join("+")}&key=bcf87dd591a44c57b21a10bed03f5daa`
        );
        const { formatted, geometry } = data.results[0];
        location = await prisma.location.create({
          data: {
            location: req.body.city,
            displayLocation: formatted,
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
      const job = await prisma.job.findUnique({ where: { id: req.params.id } });
      res.status(200).send({ result: job });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async jobEdit(req: Request, res: Response) {
    try {
      await prisma.job.update({ data: req.body, where: { id: req.params.id } });
      res.status(200).send({ message: "your job jas been edited" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
