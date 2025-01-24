import express, { Application, Request, Response } from "express";
import cors from "cors";

const PORT: number = 8000;
const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected Serves API");
});

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);
