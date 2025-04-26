import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'

import errorMiddleware from './middleware/errorMiddleware.js'
import authenticateToken from './middleware/authenticateToken.js'
import authRouter from './routes/authRouter.js'
import usersRouter from './routes/usersRouter.js'
import postsRouter from './routes/postsRouter.js'
import friendshipsRouter from './routes/friendshipsRouter.js'
import notificationsRouter from './routes/notificationsRouter.js'
import messagesRouter from './routes/messagesRouter.js'

import { initWebSocketServer } from './wsServer.js'

const app = express()

app.use(cookieParser())
app.use(rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
}))
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(authenticateToken)

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`)
  next()
})

app.use('/api/auth', authRouter)
app.use('/api/users', usersRouter)
app.use('/api/posts', postsRouter)
app.use('/api/friendships', friendshipsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/messages', messagesRouter)
app.use(errorMiddleware)

const httpServer = createServer(app)

initWebSocketServer(httpServer)

export default httpServer
