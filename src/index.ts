import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/pasport";
import authRoutes from "./router/auth.router";
import { OAuthService } from "../src/services/auth/oauth.service";
import dotenv from "dotenv";

const PORT: number = 8000;
const app: Application = express();
dotenv.config();
// Initialize OAuth
OAuthService.initialize();

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_BASE_URL_FE,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);

app.get("/api", (req: Request, res: Response) => {
  res.status(200).send("Server Connected");
});

app.listen(PORT, () =>
  console.log(`Your server is running on http://localhost:${PORT}/api`)
);
