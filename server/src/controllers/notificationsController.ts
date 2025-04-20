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

            const notifications = await prisma.notification.findMany({
                where: {
                    recipient_id: user_id
                },
            })

            res.status(200).json({ notifications: notifications });
        } catch (err) {
            next(err);
        }
    },
    deleteNotification: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const user_id = parseInt(req.user_id);
            const notification_id = parseInt(req.params.notification_id);

            const notification = await prisma.notification.findUnique({
                where: {
                    id: notification_id
                }
            })

            if (!notification) {
                res.status(404).json({ message: "Could not find notification" });
                return;
            }

            if (notification.recipient_id !== user_id) {
                res.status(403).json({ message: "Not authorized"});
            }

            await prisma.notification.delete({
                where: {
                    id: notification_id
                }
            })

            res.status(200).json({ message: "Notification deleted"});
        } catch (err) {
            next(err)
        }
    }
}

export default notificationsController;
