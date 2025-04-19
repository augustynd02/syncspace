import { Router } from "express";
import notificationsController from "../controllers/notificationsController.js";

const notificationsRouter: Router = Router();

// api/notifications

notificationsRouter.get('/', notificationsController.getNotifications);


export default notificationsRouter;
