import { Request, Response } from "express";
import prisma from "../prisma";
import dayjs from "dayjs";
import { AuthUser } from "../types/auth";
const midtransClient = require("midtrans-client");
interface MulterRequest extends Request {
  user?: AuthUser;
}
export class TransactionController {
  async createTransaction(req: MulterRequest, res: Response): Promise<void> {
    try {
      const { subscriptionId, amount } = req.body;
      const userId = req.user?.id!;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      const { id } = await prisma.transaction.create({
        data: { userId, subscriptionId, amount, status: "pending" },
      });
      res.status(201).send({
        message: "Transaction created successfully",
        username: user?.username,
        transactionId: id,
      });
    } catch (error) {
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
          user: { select: { email: true } },
          subscription: { select: { category: true } },
        },
      });
      res.status(200).send({ transactions });
    } catch (error) {
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
          updatedAt: true,
          user: { select: { fullname: true, email: true } },
          subscription: { select: { category: true } },
        },
      });
      res.status(200).send({ transaction });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to retrieve transactions by ID.",
      });
    }
  }
  async getTransactionToken(req: Request, res: Response): Promise<void> {
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
        where: { id: req.user?.id! },
        select: { fullname: true, email: true },
      });
      const snap = new midtransClient.Snap({
        isProduction: false,
        serverKey: `${process.env.MIDTRANS_SERVER_KEY}`,
      });
      const subscriptionCategory =
        subscription?.category === "professional"
          ? "Professional Plan"
          : "Standard Plan";
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
          select: { subscriptionId: true, updatedAt: true, userId: true },
        });
        const latestSubscription = await prisma.userSubscription.findUnique({
          where: {
            userId_subscriptionId: {
              userId: userTransaction?.userId!,
              subscriptionId: userTransaction?.subscriptionId!,
            },
            isActive: true,
          },
        });
        let startDate = dayjs();
        if (
          latestSubscription &&
          dayjs(latestSubscription.endDate).isAfter(dayjs())
        ) {
          startDate = dayjs(latestSubscription.endDate);
          await prisma.userSubscription.update({
            where: {
              userId_subscriptionId: {
                userId: userTransaction?.userId!,
                subscriptionId: userTransaction?.subscriptionId!,
              },
            },
            data: {
              startDate: startDate.toDate(),
              endDate: startDate.add(30, "day").toDate(),
              assessmentCount: 0,
            },
          });
        } else {
          const endDate = startDate.add(30, "day").toDate();
          await prisma.userSubscription.create({
            data: {
              userId: userTransaction?.userId!,
              subscriptionId: userTransaction?.subscriptionId!,
              startDate: startDate.toDate(),
              endDate: endDate,
            },
          });
        }
      }
      res.status(200).send({
        message: "Transaction and User Subscription updated successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to update transaction status.",
      });
    }
  }
}
