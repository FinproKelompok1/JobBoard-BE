import { Request, Response } from "express";
import prisma from "../prisma";

export class UserTransactionController {
  async getUserTransaction(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username;

      if (!username) {
        res.status(400).json({ message: "User parameter is required" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const userTransactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        include: { subscription: { select: { category: true } } },
      });

      res.status(200).send({ userTransactions });
    } catch (error) {
      console.error("Error retrieving user transaction:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve user transaction" });
    }
  }
}
