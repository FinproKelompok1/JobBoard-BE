import { Request, Response } from "express";
import prisma from "../prisma";
const midtransClient = require("midtrans-client");

export class TransactionController {
  async createTransaction(req: Request, res: Response) {
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
      console.error("Error create transaction:", error);
      res.status(500).send({
        message: "Server error: Unable to create transaction.",
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await prisma.transaction.findMany({
        select: {
          id: true,
          userId: true,
          subscriptionId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      res.status(200).send({ transactions });
    } catch (error) {
      console.error("Error retrieving transactions:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve transactions.",
      });
    }
  }

  async getTransactionById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const transactions = await prisma.transaction.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          subscriptionId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      res.status(200).send({ transactions });
    } catch (error) {
      console.error("Error retrieving transaction by ID:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve transactions by ID.",
      });
    }
  }

  async getTransactionToken(req: Request, res: Response) {}

  async updateTransaction(req: Request, res: Response) {}
}
