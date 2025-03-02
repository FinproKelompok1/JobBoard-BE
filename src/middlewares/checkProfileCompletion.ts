import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "../../prisma/generated/client";
import { AuthUser } from "../types/auth";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: AuthUser;
}

export const checkProfileCompletion = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        gender: true,
        dob: true,
        lastEdu: true,
        domicileId: true,
      },
    });

    if (
      !user ||
      !user.gender ||
      !user.dob ||
      !user.lastEdu ||
      !user.domicileId
    ) {
      res.status(403).json({
        success: false,
        message: "Profile completion required",
        incompleteProfile: true,
        missingFields: {
          gender: !user?.gender,
          dob: !user?.dob,
          lastEdu: !user?.lastEdu,
          domicileId: !user?.domicileId,
        },
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking profile completion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default checkProfileCompletion;
