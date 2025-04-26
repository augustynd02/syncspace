import { Router } from "express";
import messagesController from "../controllers/messagesController.js";

const messagesRouter: Router = Router();

// api/messages
messagesRouter.get('/:user_id', messagesController.getMessages);
messagesRouter.post('/:user_id', messagesController.sendMessage);

export default messagesRouter;
