import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Notification {
    id: number;
    message: string;
    type: 'info' | 'friend_request' | 'like' | 'comment' | 'message'
    is_read: boolean;
    created_at: Date;

    post_id: number;
    comment_id: number;

    sender_id: number;
    recipient_id: number;
}

const notificationsController = {
    getNotifications: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const user_id = parseInt(req.user_id);

            const notifications = prisma.notification.findMany({
                where: {
                    recipient_id: user_id
                },
            })

            res.status(200).json({ notifications: notifications });
        } catch (err) {
            next(err);
        }
    }
}

export default notificationsController;
