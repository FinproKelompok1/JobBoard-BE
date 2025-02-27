import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";

export async function checkPreselection(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const preselection = await prisma.preSelectionTest.findFirst({
    where: { jobId: req.params.id },
    select: { id: true },
  });
  if (!preselection?.id) {
    res.status(200).send({ isThereTest: false });
    return;
  }
  return next();
}
