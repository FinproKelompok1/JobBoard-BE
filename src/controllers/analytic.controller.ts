import { Request, Response } from "express";

export class AnalyticController {
  async getTotalGender(req: Request, res: Response) {
    try {
      res.status(200).send("Success");
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }
}
