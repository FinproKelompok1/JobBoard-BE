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
          updatedAt: true,
          user: {
            select: {
              email: true,
            },
          },
          subscription: {
            select: {
              category: true,
            },
          },
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
      const id = req.params.transactionId;
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          subscriptionId: true,
          amount: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              fullname: true,
              email: true,
            },
          },
          subscription: {
            select: {
              category: true,
            },
          },
        },
      });

      res.status(200).send({ transaction });
    } catch (error) {
      console.error("Error retrieving transaction by ID:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve transactions by ID.",
      });
    }
  }

  async getTransactionToken(req: Request, res: Response) {
    try {
      const { order_id, gross_amount } = req.body;

      const activeTransaction = await prisma.transaction.findUnique({
        where: { id: order_id },
        select: {
          subscriptionId: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });

      if (activeTransaction!.status === "cancel")
        throw new Error("Transaction has been canceled");

      const subscription = await prisma.subscription.findUnique({
        where: { id: activeTransaction?.subscriptionId },
        select: { category: true },
      });

      const user = await prisma.user.findUnique({
        where: { id: 1 },
        select: { fullname: true, email: true },
      });

      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: `${process.env.MIDTRANS_SERVER_KEY}`,
      });

      const subscriptionCategory =
        subscription?.category === "professional"
          ? "Professional Category Subscription"
          : "Standard Category Subscription";

      const parameter = {
        transaction_details: {
          order_id: order_id,
          gross_amount: gross_amount,
        },
        customer_details: {
          first_name: user!.fullname,
          email: user!.email,
        },
        item_details: [
          {
            id: activeTransaction!.subscriptionId,
            price: activeTransaction!.amount,
            quantity: 1,
            name: subscriptionCategory,
          },
        ],
        custom_expiry: {
          order_time: activeTransaction!.createdAt,
          expiry_duration: 1,
          unit: "day",
        },
      };

      const transaction = await snap.createTransaction(parameter);

      res.status(201).send({ transactionToken: transaction.token });
    } catch (error) {
      console.error("Error create transaction token:", error);
      res.status(500).send({
        message: "Server error: Unable to create transaction token.",
      });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const { order_id, transaction_status } = req.body;

      await prisma.transaction.update({
        where: { id: order_id },
        data: { status: transaction_status },
      });

      if (transaction_status === "settlement") {
        const userTransaction = await prisma.transaction.findUnique({
          where: { id: order_id },
          select: { subscriptionId: true, updatedAt: true },
        });

        const endDate = new Date(userTransaction!.updatedAt);
        endDate.setDate(endDate.getDate() + 30);

        await prisma.userSubscription.create({
          data: {
            userId: 1,
            subscriptionId: userTransaction?.subscriptionId!,
            startDate: new Date(),
            endDate: endDate,
          },
        });
      }

      res
        .status(200)
        .send({ message: "Transaction's status updated successfully" });
    } catch (error) {
      console.log("Error update transaction status:", error);
      res.status(500).send({
        message: "Server error: Unable to update transaction status.",
      });
    }
  }
}
