import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import "./services/interviewScheduleCron";
import { JobRouter } from "./routers/job.router";
import { SubscriptionRouter } from "./routers/subscription.router";
import { TransactionRouter } from "./routers/transaction.router";
import { ApplicantRouter } from "./routers/applicant.router";
import { PreselectionRouter } from "./routers/preselection.router";
import { ScheduleRouter } from "./routers/schedule.router";

const PORT: number = 8000;
const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.BASE_URL_FE!,
  })
);
export const upload = multer({ storage: multer.memoryStorage() });

const jobRouter = new JobRouter();
const applicantRouter = new ApplicantRouter();
const subscriptionRouter = new SubscriptionRouter();
const transactionRouter = new TransactionRouter();
const preselectionRouter = new PreselectionRouter();
const scheduleRouter = new ScheduleRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected Serves API");
});

app.use("/api/jobs", jobRouter.getRoutes());
app.use("/api/applicants", applicantRouter.getRoutes());
app.use("/api/subscriptions", subscriptionRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());
app.use("/api/preselection", preselectionRouter.getRoutes());
app.use("/api/schedule", scheduleRouter.getRoutes());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app;
