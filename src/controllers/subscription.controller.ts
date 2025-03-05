import { Request, Response } from "express";
import prisma from "../prisma";
import { SubscriptionCategory } from "prisma/generated/client";
import { sendInvoiceEmail } from "../services/invoiceEmail";
import dayjs from "dayjs";

export class SubscriptionController {
  async createSubscription(req: Request, res: Response) {
    try {
      const { category, price, feature } = req.body;

      await prisma.subscription.create({
        data: { category, price, feature },
      });

      res.status(201).send({ message: "Subscription created successfully" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to create subscription." });
    }
  }

  async getSubscriptions(req: Request, res: Response) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        select: {
          id: true,
          category: true,
          price: true,
          feature: true,
          UserSubscription: { select: { userId: true, isActive: true } },
        },
      });

      res.status(200).send({ subscriptions });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to retrieve subscriptions.",
      });
    }
  }

  async getSubscriptionById(req: Request, res: Response) {
    try {
      const subscriptionId = req.params.subscriptionId;
      const subscription = await prisma.subscription.findUnique({
        where: { id: +subscriptionId },
        select: { id: true, category: true, price: true, feature: true },
      });

      res.status(200).send({ subscription });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to retrieve subscription by ID.",
      });
    }
  }

  async editSubscription(req: Request, res: Response) {
    try {
      const subscriptionIdid = req.params.subscriptionId;
      const { category, price, feature } = req.body;

      const data: {
        category?: SubscriptionCategory;
        price?: number;
        feature?: string;
      } = {};

      if (category !== undefined) data.category = category;
      if (price !== undefined) data.price = price;
      if (feature !== undefined) data.feature = feature;

      if (Object.keys(data).length === 0) {
        res.status(400).send({ message: "No fields to update provided" });
        return;
      }

      await prisma.subscription.update({
        where: { id: +subscriptionIdid },
        data,
      });

      res.status(200).send({
        message: `Subscription ID ${subscriptionIdid} updated successfully`,
      });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to update subscription.",
      });
    }
  }

  async deleteSubcription(req: Request, res: Response) {
    try {
      const id = +req.params.subscriptionId;

      const subscription = await prisma.subscription.findUnique({
        where: { id },
      });

      if (!subscription) {
        res.status(404).json({ message: "Subscription not found" });
        return;
      }

      await prisma.subscription.delete({ where: { id: id } });

      res
        .status(200)
        .json({ message: `Subscription ID ${id} deleted successfully` });
    } catch (error) {
      console.error("Error delete subscription :", error);
      res.status(500).send({
        message: "Server error: Unable to delete subscription.",
      });
    }
  }

  async getSubscriptionUsers(req: Request, res: Response) {
    try {
      const id = req.params.subscriptionId;
      const subscription = await prisma.subscription.findUnique({
        where: { id: +id },
        select: {
          UserSubscription: {
            select: {
              startDate: true,
              endDate: true,
              assessmentCount: true,
              isActive: true,
              subscription: { select: { category: true } },
              user: {
                select: { email: true, fullname: true },
              },
            },
          },
        },
      });

      res
        .status(200)
        .send({ subscriptionUsers: subscription?.UserSubscription });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to retrieve subscription users.",
      });
    }
  }

  async sendSubscriptionEmail(req: Request, res: Response) {
    const startOfTomorrow = dayjs().add(1, "day").startOf("day").toDate();
    const endOfTomorrow = dayjs().add(1, "day").endOf("day").toDate();

    try {
      const expiringSubscription = await prisma.userSubscription.findMany({
        where: {
          endDate: { gte: startOfTomorrow, lt: endOfTomorrow },
          isActive: true,
        },
        include: { user: true },
      });

      for (const subscription of expiringSubscription) {
        try {
          await sendInvoiceEmail({
            email: subscription.user.email,
            username: subscription.user.username,
            fullname: subscription.user.fullname!,
          });
        } catch (emailError) {
          console.error(
            `Failed to send email to ${subscription.user.email}:`,
            emailError
          );
        }
      }

      const today = new Date();
      await prisma.userSubscription.updateMany({
        where: { endDate: { lt: today }, isActive: true },
        data: { isActive: false },
      });

      res
        .status(200)
        .json({ message: "Subscription emails sent successfully" });
    } catch (error) {
      console.error("Error processing subscriptions:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
