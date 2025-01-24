import express, { Application, Request, Response } from "express";
import cors from "cors";
import { JobRouter } from "./routers/job.router";

const PORT: number = 8000;
const app: Application = express();

app.use(cors());
app.use(express.json());

const jobRouter = new JobRouter();

app.use("/api/jobs", jobRouter.getRoutes());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected");
});

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);
