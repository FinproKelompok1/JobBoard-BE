import express, { Application, Request, Response } from "express";
import cors from "cors";
import { SubscriptionRouter } from "./routers/subscription.router";

const PORT: number = 8000;
const app: Application = express();

app.use(cors());
app.use(express.json());

const subscriptionRouter = new SubscriptionRouter();

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected");
});

app.use("/api/subscriptions", subscriptionRouter.getRouter());

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);
