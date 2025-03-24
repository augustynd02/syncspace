import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import type { Request, Response } from "express";

import authRouter from "./routes/authRouter.js";

import errorMiddleware from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("test");
});

app.use('/api/auth', authRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
