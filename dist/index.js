"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const pasport_1 = __importDefault(require("./config/pasport"));
const auth_router_1 = __importDefault(require("./routers/auth.router"));
const oauth_service_1 = require("../src/services/auth/oauth.service");
const express_session_1 = __importDefault(require("express-session"));
require("./services/interviewReminderCron");
require("./services/subscriptionCron");
const userProfile_router_1 = __importDefault(require("./routers/userProfile.router"));
const job_router_1 = require("./routers/job.router");
const subscription_router_1 = require("./routers/subscription.router");
const transaction_router_1 = require("./routers/transaction.router");
const applicant_router_1 = require("./routers/applicant.router");
const preselection_router_1 = require("./routers/preselection.router");
const schedule_router_1 = require("./routers/schedule.router");
const analytic_router_1 = require("./routers/analytic.router");
const userSubscription_router_1 = require("./routers/userSubscription.router");
const cv_router_1 = require("./routers/cv.router");
const assessment_router_1 = require("./routers/assessment.router");
const assessmentQuestion_router_1 = require("./routers/assessmentQuestion.router");
const userAssessment_router_1 = require("./routers/userAssessment.router");
const company_router_1 = require("./routers/company.router");
const jobdis_router_1 = require("./routers/jobdis.router");
const apply_router_1 = require("./routers/apply.router");
const userTransaction_router_1 = require("./routers/userTransaction.router");
const review_router_1 = require("./routers/review.router");
const password_router_1 = __importDefault(require("./routers/password.router"));
const PORT = 8000;
const app = (0, express_1.default)();
oauth_service_1.OAuthService.initialize();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
}));
app.use(pasport_1.default.initialize());
app.use((0, cors_1.default)({
    origin: process.env.BASE_URL_FE,
    credentials: true,
}));
exports.upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const jobRouter = new job_router_1.JobRouter();
const applicantRouter = new applicant_router_1.ApplicantRouter();
const subscriptionRouter = new subscription_router_1.SubscriptionRouter();
const transactionRouter = new transaction_router_1.TransactionRouter();
const preselectionRouter = new preselection_router_1.PreselectionRouter();
const scheduleRouter = new schedule_router_1.ScheduleRouter();
const analyticRouter = new analytic_router_1.AnalyticRouter();
const userSubscriptionRouter = new userSubscription_router_1.UserSubscriptionRouter();
const cvRouter = new cv_router_1.CvRouter();
const assessmentRouter = new assessment_router_1.AssessmentRouter();
const assessmentQuestionRouter = new assessmentQuestion_router_1.AssessmentQuestionRouter();
const userAssessmentRouter = new userAssessment_router_1.UserAssessmentRouter();
const companyRouter = new company_router_1.CompanyRouter();
const jobDiscoveryRouter = new jobdis_router_1.JobDiscoveryRouter();
const applyRouter = new apply_router_1.ApplyRouter();
const userTransactionRouter = new userTransaction_router_1.UserTransactionRouter();
const reviewRouter = new review_router_1.ReviewRouter();
app.get("/api", (req, res) => {
    res.status(200).send("Connected to Talent Bridge API");
});
app.use("/api/auth", auth_router_1.default, userProfile_router_1.default);
app.use("/api/password", password_router_1.default);
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
app.listen(PORT, () => console.log(`Your server is running on http://localhost:${PORT}/api`));
exports.default = app;
