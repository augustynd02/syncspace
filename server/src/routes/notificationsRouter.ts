import { Router } from "express";
import notificationsController from "../controllers/notificationsController.js";

const notificationsRouter: Router = Router();

// api/notifications

notificationsRouter.get('/', notificationsController.getNotifications);
notificationsRouter.delete('/:notification_id', notificationsController.deleteNotification)


export default notificationsRouter;
