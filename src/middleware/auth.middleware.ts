import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../prisma/generated/client";
import { AuthUser, UserRole, VerificationToken } from "../types/auth";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequestBody {
  email: string;
  userType: UserRole;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("Headers:", req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

export const requireVerified = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, userType } = req.body;

    if (userType === "admin") {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin?.isVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }
    } else {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.isVerified) {
        return res.status(403).json({ message: "Email not verified" });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// export const requireDeveloper = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     if (!req.user || req.user.role !== "developer") {
//       return res.status(403).json({ message: "Developer access required" });
//     }
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Developer access required" });
//   }
// };

export const checkVerificationTimeout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as VerificationToken & {
      exp: number;
    };

    if (Date.now() >= decoded.exp * 1000) {
      throw new Error("Verification link expired");
    }

    req.verificationToken = decoded;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(400).json({ message: "Verification link expired" });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
