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
      const {
        page = "1",
        limit = "10",
        sort = "createdAt",
        order = "desc",
        status,
        email,
      } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const orderBy = { [sort as string]: order === "desc" ? "desc" : "asc" };
      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (email) {
        where.user = { email: { contains: email, mode: "insensitive" } };
      }
      const transactions = await prisma.transaction.findMany({
        where,
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
        skip,
        take: pageSize,
        orderBy,
      });
      const totalTransactions = await prisma.transaction.count({ where });
      res.status(200).send({
        transactions,
        totalPages: Math.ceil(totalTransactions / pageSize),
        currentPage: pageNumber,
      });
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
  async getTransactionToken(req: MulterRequest, res: Response): Promise<void> {
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
      if (!activeTransaction) throw new Error("Transaction not found");
      if (activeTransaction.status === "cancel")
        throw new Error("Transaction has been canceled");
      const subscription = await prisma.subscription.findUnique({
        where: { id: activeTransaction.subscriptionId },
        select: { category: true },
      });
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        select: { fullname: true, email: true },
      });
      if (!user) throw new Error("User not found");
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
          gross_amount: activeTransaction.amount,
        },
        customer_details: {
          first_name: user?.fullname || "First Name",
          email: user!.email,
        },
        item_details: [
          {
            id: activeTransaction.subscriptionId,
            price: activeTransaction.amount,
            quantity: 1,
            name: subscriptionCategory,
          },
        ],
        custom_expiry: {
          order_time: activeTransaction.createdAt,
          expiry_duration: 1,
          unit: "day",
        },
      };
      const transaction = await snap.createTransaction(parameter);
      res.status(201).json({ transactionToken: transaction.token });
    } catch (error: any) {
      console.error("Transaction Token Error:", error); // Log the full error
      res.status(500).json({
        message:
          error.message || "Server error: Unable to create transaction token.",
        details: error.response?.data || "No additional details available.",
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
          select: { subscriptionId: true, userId: true },
        });

        if (!userTransaction) {
          res.status(404).send({ message: "Transaction not found" });
          return;
        }

        const { userId, subscriptionId } = userTransaction;
        console.log("Updating subscription for:", { userId, subscriptionId });

        const existingSubscription = await prisma.userSubscription.findFirst({
          where: {
            userId,
            subscriptionId,
          },
        });

        console.log("Existing Subscription:", existingSubscription);

        let startDate = dayjs();
        if (existingSubscription) {
          if (existingSubscription.isActive) {
            startDate = dayjs(existingSubscription.endDate).isAfter(dayjs())
              ? dayjs(existingSubscription.endDate)
              : dayjs();
          }
          await prisma.userSubscription.update({
            where: {
              userId_subscriptionId: { userId, subscriptionId },
            },
            data: {
              startDate: startDate.toDate(),
              endDate: startDate.add(30, "day").toDate(),
              assessmentCount: 0,
              isActive: true,
            },
          });
        } else {
          await prisma.userSubscription.create({
            data: {
              userId,
              subscriptionId,
              startDate: startDate.toDate(),
              endDate: startDate.add(30, "day").toDate(),
              isActive: true,
            },
          });
        }
      }

      res.status(200).send({
        message: "Transaction and User Subscription updated successfully",
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      res.status(500).send({
        message: "Server error: Unable to update transaction status.",
      });
    }
  }
}
