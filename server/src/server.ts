import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { S3Client } from '@aws-sdk/client-s3';

import authRouter from "./routes/authRouter.js";

import errorMiddleware from './middleware/errorMiddleware.js';
import authenticateToken from './middleware/authenticateToken.js';
import usersRouter from './routes/usersRouter.js';
import postsRouter from './routes/postsRouter.js';
import friendshipsRouter from './routes/friendshipsRouter.js';

dotenv.config();

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
	credentials: {
		accessKeyId: ACCESS_KEY!,
		secretAccessKey: SECRET_ACCESS_KEY!
	},
	region: BUCKET_REGION!
})


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
app.use('/api/friendships', friendshipsRouter);

app.use(errorMiddleware);

export default app;
