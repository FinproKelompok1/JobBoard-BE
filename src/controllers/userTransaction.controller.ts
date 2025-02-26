import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthUser } from "src/types/auth";
interface MulterRequest extends Request {
  user?: AuthUser;
}

export class UserTransactionController {
  async getUserTransaction(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = "1",
        limit = "10",
        sort = "createdAt",
        order = "desc",
        status,
      } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const pageSize = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * pageSize;
      const orderBy = { [sort as string]: order === "desc" ? "desc" : "asc" };
      const where: any = {};
      if (status) {
        where.status = status;
      }
      const userTransactions = await prisma.transaction.findMany({
        where: { userId: req.user?.id, ...where },
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
        userTransactions,
        totalPages: Math.ceil(totalTransactions / pageSize),
        currentPage: pageNumber,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve user transaction" });
    }
  }
}
