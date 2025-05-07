import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import isAuthenticated from '../utils/isAuthenticated.js';

import Notification from '../types/Notification.js';

const prisma = new PrismaClient();

const notificationsController = {
    getNotifications: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isAuthenticated(req, res)) return;

            const user_id = parseInt(req.user_id);

            const notifications = await prisma.notification.findMany({
                where: {
                    recipient_id: user_id
                },
            }) as Notification[]

            res.status(200).json({ notifications: notifications });
        } catch (err) {
            next(err);
        }
    },
    deleteNotification: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!isAuthenticated(req, res)) return;

            const user_id = parseInt(req.user_id);
            const notification_id = parseInt(req.params.notification_id);

            const notification = await prisma.notification.findUnique({
                where: {
                    id: notification_id
                }
            }) as Notification

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
