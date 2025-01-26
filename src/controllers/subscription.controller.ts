import { Request, Response } from "express";
import prisma from "../prisma";

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
      const id = req.params.id;
      const subscription = await prisma.subscription.findUnique({
        where: { id: +id },
        select: { id: true, category: true, price: true, feature: true },
      });

      if (!subscription) {
        res
          .status(404)
          .send({ message: `No subscription found with ID ${id}` });
        return;
      }

      res.status(200).send({ subscription });
    } catch (error) {
      console.error("Error retrieving subscription by ID:", error);
      res.status(500).send({
        message: "Server error: Unable to retrieve subscription.",
      });
    }
  }

  async editSubscription(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const { price } = req.body;

      await prisma.subscription.update({
        where: { id: +id },
        data: { price },
      });

      res.status(200).send({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).send({
        message: "Server error: Unable to update subscription.",
      });
    }
  }
}
