import { Request, Response } from "express";
import prisma from "../prisma";
import { IReqBody } from "../types/preselection";

export class PreselectionController {
  async getPreselection(req: Request, res: Response) {
    try {
      const preselection = await prisma.preSelectionTest.findFirst({
        where: { jobId: req.params.id },
        select: {
          id: true,
          title: true,
          description: true,
        },
      });
      res.status(200).send({ result: preselection });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getPreselectionQuestions(req: Request, res: Response) {
    try {
      const questions = await prisma.selectionTestQuestion.findMany({
        where: {
          preSelectionTest: { jobId: req.params.id },
        },
      });
      res.status(200).send({ result: questions });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async submitPreselection(req: Request, res: Response) {
    try {
      const { answer } = req.body;
      let totalCorrectAnswer = 0;
      for (const item of answer) {
        if (item.selectedOption == item.correctAnswer) {
          totalCorrectAnswer++;
        }
      }
      const selectionTestResult = (totalCorrectAnswer / answer.length) * 100;
      await prisma.jobApplication.update({
        where: {
          userId_jobId: { jobId: req.params.id, userId: req.user?.id! },
        },
        data: { selectionTestResult },
      });
      res
        .status(200)
        .send({ message: "Thank you, your answers was submitted" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createPreselection(req: Request<{}, {}, IReqBody>, res: Response) {
    try {
      const { title, description, jobId } = req.body;
      const { id: preSelectionTestId } = await prisma.preSelectionTest.create({
        data: { title, description, jobId },
      });
      const formattedQuestions = req.body.preselectionQuestions.map(
        (question) => ({
          ...question,
          preSelectionTestId,
        })
      );
      await prisma.selectionTestQuestion.createMany({
        data: formattedQuestions,
      });
      res.status(200).send({ message: "Test successfully created" });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async setActiveTest(req: Request, res: Response) {
    try {
      const { isTestActive } = req.body;
      await prisma.job.update({
        where: { id: req.params.id },
        data: { isTestActive },
      });
      res.status(200).send({
        isThereTest: true,
        message: `Your job test has been ${
          isTestActive ? "activated" : "unactivated"
        }`,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
