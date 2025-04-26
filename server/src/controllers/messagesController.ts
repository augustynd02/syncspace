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
    }
}

export default messagesController;
