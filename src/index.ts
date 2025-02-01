import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import { JobRouter } from "./routers/job.router";
import { SubscriptionRouter } from "./routers/subscription.router";
import { TransactionRouter } from "./routers/transaction.router";
import { ApplicantRouter } from "./routers/applicant.router";

const PORT: number = 8000;
const app: Application = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.BASE_URL_FE!,
    // credentials: true,
  })
);
// app.use(cors());
export const upload = multer({ storage: multer.memoryStorage() });

const jobRouter = new JobRouter();
const applicantRouter = new ApplicantRouter()
const subscriptionRouter = new SubscriptionRouter();
const transactionRouter = new TransactionRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected Serves API");
});

app.use("/api/jobs", jobRouter.getRoutes());
app.use("/api/applicants", applicantRouter.getRoutes());
app.use("/api/subscriptions", subscriptionRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app;
