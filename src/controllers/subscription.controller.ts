import { Request, Response } from "express";
import prisma from "../prisma";
import { SubscriptionCategory } from "prisma/generated/client";

export class SubscriptionController {
  async createSubscription(req: Request, res: Response) {
    try {
      const { category, price, feature } = req.body;

      await prisma.subscription.create({
        data: { category, price, feature },
      });

      res.status(201).send({ message: "Subscription created successfully" });
    } catch (error) {
      console.log("Error create subscription:", error);
      res
        .status(500)
        .send({ message: "Server error: Unable to create subscription." });
    }
  }

  async getSubscriptions(req: Request, res: Response) {
    try {
      const subscriptions = await prisma.subscription.findMany({
        select: { id: true, category: true, price: true, feature: true },
      });

      res.status(200).send({ subscriptions });
    } catch (error) {
      console.error("Error retrieving subscriptions:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve subscriptions.",
      });
    }
  }

  async getSubscriptionById(req: Request, res: Response) {
    try {
      const id = req.params.subscriptionId;
      const subscription = await prisma.subscription.findUnique({
        where: { id: +id },
        select: { id: true, category: true, price: true, feature: true },
      });

      res.status(200).send({ subscription });
    } catch (error) {
      console.error("Error retrieving subscription by ID:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve subscription by ID.",
      });
    }
  }

  async editSubscription(req: Request, res: Response) {
    try {
      const id = req.params.subscriptionId;
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
        where: { id: +id },
        data,
      });

      res
        .status(200)
        .send({ message: `Subscription ID ${id} updated successfully` });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).send({
        message: "Server error: Unable to update subscription.",
      });
    }
  }

  async deleteSubcription(req: Request, res: Response) {
    try {
      const id = req.params.subscriptionId;

      await prisma.subscription.delete({ where: { id: +id } });

      res
        .status(200)
        .send({ message: `Subscription ID ${id} deleted successfully` });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).send({
        message: "Server error: Unable to delete subscription.",
      });
    }
  }
}
