import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

const messagesController = {
    getMessages: async (req: Request, res: Response, next: NextFunction) => {
        const currentUser_id = req.user_id ? parseInt(req.user_id) : null;
        const otherUser_id = parseInt(req.params.user_id);

        if (!currentUser_id) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    {
                        sender_id: currentUser_id,
                        receiver_id: otherUser_id
                    },
                    {
                        sender_id: otherUser_id,
                        receiver_id: currentUser_id
                    }
                ]
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        res.status(200).json({ messages: messages });
    },
    sendMessage: async (req: Request, res: Response, next: NextFunction) => {
        const currentUser_id = req.user_id ? parseInt(req.user_id) : null;
        const otherUser_id = parseInt(req.params.user_id);

        if (!currentUser_id) {
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        const senderUser = await prisma.user.findUnique({
            where: {
                id: currentUser_id
            }
        })

        if (!senderUser) {
            res.status(404).json({ message: "Couldn't retrieve the sender. "});
            return;
        }

        const newMessage = await prisma.message.create({
            data: {
                sender_id: currentUser_id,
                receiver_id: otherUser_id,
                content: req.body.message
            }
        })

        const notification = await prisma.notification.create({
            data: {
                sender_id: currentUser_id,
                recipient_id: otherUser_id,
                type: 'message',
                message: `${senderUser.name} ${senderUser.middle_name || ''} ${senderUser.last_name} has sent you a message.`
            }
        })

        res.status(200).json({ message: newMessage });
    }
}

export default messagesController;
