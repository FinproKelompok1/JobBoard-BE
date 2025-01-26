import { PrismaClient } from "../prisma/generated/client";

export default new PrismaClient({ log: ["query", "info", "warn", "error"] });
