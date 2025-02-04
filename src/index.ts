import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { JobRouter } from "./routers/job.router";
import multer from "multer";
import { SubscriptionRouter } from "./routers/subscription.router";
import { TransactionRouter } from "./routers/transaction.router";
import { UserSubscriptionRouter } from "./routers/userSubscription.router";
import "./services/subscriptionCron";

dotenv.config();

const PORT: number = 8000;
const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.BASE_URL_FE!,
    credentials: true,
  })
);

export const upload = multer({ storage: multer.memoryStorage() });

const jobRouter = new JobRouter();
const subscriptionRouter = new SubscriptionRouter();
const transactionRouter = new TransactionRouter();
const userSubscriptionRouter = new UserSubscriptionRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Connected to Talent Bridge API");
});

app.use("/api/jobs", jobRouter.getRoutes());
app.use("/api/subscriptions", subscriptionRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());
app.use("/api/user-subscription", userSubscriptionRouter.getRouter());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app;
