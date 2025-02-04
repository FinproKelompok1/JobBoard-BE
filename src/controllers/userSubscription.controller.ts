import { Request, Response } from "express";
import prisma from "../prisma";

export class UserSubscriptionController {
  async getUserSubscription(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUnique({
        where: {
          username,
        },
        include: {
          UserSubscription: {
            select: {
              subscriptionId: true,
              startDate: true,
              endDate: true,
              isActive: true,
              assessmentCount: true,
              subscription: { select: { category: true, price: true } },
            },
          },
        },
      });
      res.status(200).send({ userSubscription: user?.UserSubscription });
    } catch (error) {
      console.error("Error retrieving user subscription:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve user subscription.",
      });
    }
  }
  async renewUseSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId, amount } = req.body;
      const userId = 1;
      const { id } = await prisma.transaction.create({
        data: {
          userId,
          subscriptionId,
          amount,
          status: "pending",
        },
      });
      res.status(201).send({
        message: "Transaction created successfully",
        transactionId: id,
      });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to create transaction.",
      });
    }
  }
}
