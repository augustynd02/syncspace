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
        const url = new URL(req.url || '', 'http://localhost');
        const token = url.searchParams.get('token');

        if (!token) {
            console.error('No token found, so terminating.');
            ws.close();
            return;
        }
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.TOKEN_SECRET!);

            if (decoded.purpose !== 'websocket') {
                throw new Error('Invalid token purpose');
            }
        } catch (err) {
            console.error('Invalid token:', err);
            ws.close();
            return;
        }

        const user_id = Number(decoded.id);
        if (Number.isNaN(user_id)) {
            ws.close();
            return;
        }

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
