import { Request, Response } from "express";
import prisma from "../prisma";
import { IReqBody } from "../types/preselection";

export class PreselectionController {
  async getPreselection(req: Request, res: Response) {
    try {
      const preselection = await prisma.preSelectionTest.findUnique({
        where: { id: +req.params.id },
      });
      res.status(200).send({ message: preselection });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async createPreSelection(req: Request<{}, {}, IReqBody>, res: Response) {
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
