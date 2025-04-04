import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import type { Request, Response } from "express";

import authRouter from "./routes/authRouter.js";

import errorMiddleware from './middleware/errorMiddleware.js';
import authenticateToken from './middleware/authenticateToken.js';
import usersRouter from './routes/usersRouter.js';
import postsRouter from './routes/postsRouter.js';

dotenv.config();


const app = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

app.use(cookieParser());
app.use(cors({
	origin: "http://localhost:3000",
	credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticateToken)

app.use((req, res, next) => {
	console.log(`Request: ${req.method} ${req.path}`)
	next();
})

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);

app.use(errorMiddleware);

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
