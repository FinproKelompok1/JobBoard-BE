import express, { Application, Request, Response } from "express";
import cors from "cors";
import { JobRouter } from "./routers/job.router";
import multer from "multer";

const PORT: number = 8000;
const app: Application = express();

app.use(cors());
app.use(express.json());
export const upload = multer({ storage: multer.memoryStorage() });

const jobRouter = new JobRouter();

app.use("/api/jobs", jobRouter.getRoutes());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected");
});

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);

export default app