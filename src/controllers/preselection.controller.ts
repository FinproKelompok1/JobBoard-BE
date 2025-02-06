import { Request, Response } from "express";
import prisma from "../prisma";

export class PreselectionController {
  async getPreselection(req: Request, res: Response) {
    try {
      const preselection = await prisma.preSelectionTest.findMany();
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
}
