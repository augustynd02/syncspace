import { WebSocketServer, WebSocket } from 'ws'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type http from 'http'

interface ExtendedWebSocket extends WebSocket {
    user_id?: number
}

export function initWebSocketServer(httpServer: http.Server) {
    const prisma = new PrismaClient()
    const userSockets = new Map<number, ExtendedWebSocket>()

    const wss = new WebSocketServer({ server: httpServer, path: '/ws' })

    wss.on('connection', (ws: ExtendedWebSocket, req) => {
        console.log('Someone is connecting.');
        const cookieHeader = req.headers.cookie
        const token = cookieHeader
            ?.split('; ')
            .find(part => part.startsWith('token='))
            ?.split('=')[1]

        if (!token) {
            ws.close()
            return
        }

        let decoded: any
        try {
            decoded = jwt.verify(token, process.env.TOKEN_SECRET!)
        } catch {
            ws.close()
            return
        }

        const user_id = Number((decoded as { id: string }).id)
        if (Number.isNaN(user_id)) {
            ws.close()
            return
        }
        console.log(`Conntected user with id: ${user_id}`)
        ws.user_id = user_id
        userSockets.set(user_id, ws)

        ws.on('message', async (data) => {
            let msg: any
            try {
                msg = JSON.parse(data.toString())
            } catch {
                return
            }

            if (msg.type === 'message') {
                const { toUserId, content } = msg

                const newMessage = await prisma.message.create({
                    data:
                        {
                            sender_id: user_id,
                            receiver_id: toUserId,
                            content: content
                        }
                })

                const payload = JSON.stringify({ type: 'new_message', message: newMessage })

                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(payload)
                }

                const recv = userSockets.get(toUserId)
                if (recv && recv.readyState === WebSocket.OPEN) {
                    recv.send(payload)
                }
            }
        })

        ws.on('close', () => {
            userSockets.delete(user_id)
        })

        ws.on('error', (err) => {
            console.error(`WS error for user ${ws.user_id}:`, err)
        })
    })

    console.log('WebSocket server launched at /ws')
}
