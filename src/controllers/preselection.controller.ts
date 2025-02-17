import { Request, Response } from "express";
import prisma from "../prisma";

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

  async createPreSelection(req: Request, res: Response) {
    try {
      const preselection = await prisma.preSelectionTest.create({
        data: req.body,
      });
      res.status(200).send({ message: preselection });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async setActiveTest(req: Request, res: Response) {
    try {
      const { isTestActive } = req.body;
      console.log(req.body);
      await prisma.job.update({
        where: { id: req.params.id },
        data: { isTestActive },
      });
      res.status(200).send({
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
