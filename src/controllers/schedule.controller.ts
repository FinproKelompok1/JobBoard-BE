import { Request, Response } from "express";
import prisma from "../prisma";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "../services/mailer";
import { formatDate } from "../helpers/dateFormatter";
import { formatTime } from "../helpers/timeFormatter";
import { interviewReminder } from "../services/interviewReminderCron";

export class ScheduleController {
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
      res.status(400).send(err);
    }
  }

  async createSchedule(req: Request, res: Response) {
    try {
      const { jobId, userId, startTime } = req.body;
      await prisma.interview.create({ data: { jobId, userId, startTime } });

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullname: true },
      });

      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, admin: { select: { companyName: true } } },
      });

      const templatePath = path.join(
        __dirname,
        "../templates",
        "interviewSchedule.html"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({
        applicant_name: user?.fullname,
        job_title: job?.title,
        company_name: job?.admin.companyName,
        date: formatDate(startTime),
        time: formatTime(startTime),
      });

      await transporter.sendMail({
        from: "Talent Bridge",
        to: user?.email,
        subject: `Exciting Opportunity! Interview Scheduled for ${job?.title}`,
        html,
      });
      res.status(200).send({ message: "Your schedule has been set" });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async updateSchedule(req: Request, res: Response) {
    try {
      const oldTime = await prisma.interview.findUnique({
        where: {
          userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
        },
        select: { startTime: true },
      });

      await prisma.interview.update({
        where: {
          userId_jobId: { userId: req.body.userId, jobId: req.body.jobId },
        },
        data: { startTime: req.body.startTime },
      });

      const user = await prisma.user.findUnique({
        where: { id: req.body.userId },
        select: { email: true, fullname: true },
      });

      const job = await prisma.job.findUnique({
        where: { id: req.body.jobId },
        select: { title: true, admin: { select: { companyName: true } } },
      });

      const templatePath = path.join(
        __dirname,
        "../templates",
        "interviewReschedule.html"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({
        applicant_name: user?.fullname,
        job_title: job?.title,
        company_name: job?.admin.companyName,
        previous_date: formatDate(`${oldTime?.startTime}`),
        previous_time: formatTime(`${oldTime?.startTime}`),
        new_date: formatDate(req.body.startTime),
        new_time: formatTime(req.body.startTime),
      });

      await transporter.sendMail({
        from: "Talent Bridge",
        to: user?.email,
        subject: "Interview Rescheduled - New Date & Time for Your Interview",
        html,
      });
      res.status(200).send({ message: "Your interview has been rescheduled" });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async deleteSchedule(req: Request, res: Response) {
    try {
      await prisma.interview.delete({
        where: {
          userId_jobId: {
            userId: Number(req.query.userId),
            jobId: req.query.jobId as string,
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: Number(req.query.userId) },
        select: { email: true, fullname: true },
      });

      const job = await prisma.job.findUnique({
        where: { id: req.query.jobId as string },
        select: { title: true, admin: { select: { companyName: true } } },
      });

      const templatePath = path.join(
        __dirname,
        "../templates",
        "interviewDeleted.html"
      );
      const templateSource = fs.readFileSync(templatePath, "utf-8");
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate({
        applicant_name: user?.fullname,
        job_title: job?.title,
        company_name: job?.admin.companyName,
      });

      await transporter.sendMail({
        from: "Talent Bridge",
        to: user?.email,
        subject: "Interview Update - Unfortunately!",
        html,
      });
      res.status(200).send({ message: "Your schedule has been deleted" });
    } catch (err) {
      res.status(400).send(err);
    }
  }

  async reminderSchedule(req: Request, res: Response) {
    try {
      await interviewReminder();
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
