import { Request, Response } from "express";
import prisma from "../prisma";

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
      await prisma.job.create({ data: req.body });

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
