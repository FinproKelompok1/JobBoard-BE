import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import "./services/interviewReminderCron";
import "./services/subscriptionCron";
import { JobRouter } from "./routers/job.router";
import { SubscriptionRouter } from "./routers/subscription.router";
import { TransactionRouter } from "./routers/transaction.router";
import { ApplicantRouter } from "./routers/applicant.router";
import { PreselectionRouter } from "./routers/preselection.router";
import { ScheduleRouter } from "./routers/schedule.router";
import { AnalyticRouter } from "./routers/analytic.router";
import { UserSubscriptionRouter } from "./routers/userSubscription.router";
import { CvRouter } from "./routers/cv.router";
import { AssessmentRouter } from "./routers/assessment.router";
import { AssessmentQuestionRouter } from "./routers/assessmentQuestion.router";
import { UserAssessmentRouter } from "./routers/userAssessment.router";

dotenv.config();

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
const analyticRouter = new AnalyticRouter();
const userSubscriptionRouter = new UserSubscriptionRouter();
const cvRouter = new CvRouter();
const assessmentRouter = new AssessmentRouter();
const assessmentQuestionRouter = new AssessmentQuestionRouter();
const userAssessmentRouter = new UserAssessmentRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Connected to Talent Bridge API");
});

app.use("/api/jobs", jobRouter.getRoutes());
app.use("/api/applicants", applicantRouter.getRoutes());
app.use("/api/jobs", jobRouter.getRoutes());
app.use("/api/subscriptions", subscriptionRouter.getRouter());
app.use("/api/transactions", transactionRouter.getRouter());
app.use("/api/preselection", preselectionRouter.getRoutes());
app.use("/api/schedule", scheduleRouter.getRoutes());
app.use("/api/analytics", analyticRouter.getRoutes());
app.use("/api/user-subscriptions", userSubscriptionRouter.getRouter());
app.use("/api/cv", cvRouter.getRouter());
app.use("/api/assessments", assessmentRouter.getRouter());
app.use("/api/assessment-questions", assessmentQuestionRouter.getRouter());
app.use("/api/user-assessments", userAssessmentRouter.getRouter());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app;
