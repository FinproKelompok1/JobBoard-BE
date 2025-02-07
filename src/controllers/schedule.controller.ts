import { Request, Response } from "express";
import prisma from "../prisma";

export class ScheduleController {
  async getSchedules(req: Request, res: Response) {
    try {
      const schedules = await prisma.interview.findMany();
      res.status(200).send({ result: schedules });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getApplicantSchedule(req: Request, res: Response) {
    try {
      const startTime = await prisma.interview.findFirst({
        where: {
          AND: [{ jobId: req.body.jobId }, { userId: req.body.userId }],
        },
        select: { startTime: true },
      });
      res.status(200).send({ result: startTime });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createSchedule(req: Request, res: Response) {
    try {
      await prisma.interview.create({ data: req.body });
      res.status(200).send({ message: "Your schedule has been set" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async updateSchedule(req: Request, res: Response) {
    try {
      await prisma.interview.update({
        where: {
          userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
        },
        data: req.body.data,
      });
      res.status(200).send({ message: "Your date has been rescheduled" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
