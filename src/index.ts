import dotenv from "dotenv";
dotenv.config();
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import passport from "./config/pasport";
import authRoutes from "./routers/auth.router";
import { OAuthService } from "../src/services/auth/oauth.service";
import session from "express-session";
// import "./services/interviewReminderCron";
import "./services/subscriptionCron";
import userProfileRoutes from "./routers/userProfile.router";
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
import { CompanyRouter } from "./routers/company.router";
import { JobDiscoveryRouter } from "./routers/jobdis.router";
import { ApplyRouter } from "./routers/apply.router";
import { UserTransactionRouter } from "./routers/userTransaction.router";
import { ReviewRouter } from "./routers/review.router";
import passwordRoutes from "./routers/password.router";

const PORT: number = 8000;
const app: Application = express();

OAuthService.initialize();

app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());

app.use(
  cors({
    origin: process.env.BASE_URL_FE!,
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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
const companyRouter = new CompanyRouter();
const jobDiscoveryRouter = new JobDiscoveryRouter();
const applyRouter = new ApplyRouter();
const userTransactionRouter = new UserTransactionRouter();
const reviewRouter = new ReviewRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Connected to Talent Bridge API");
});

app.use("/api/auth", authRoutes, userProfileRoutes);
app.use("/api/password", passwordRoutes);
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
app.use("/api/companies", companyRouter.getRoutes());
app.use("/api/discover", jobDiscoveryRouter.getRoutes());
app.use("/api/apply", applyRouter.getRoutes());
app.use("/api/user-transactions", userTransactionRouter.getRouter());
app.use("/api/reviews", reviewRouter.getRouter());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app;
