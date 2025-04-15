import { Router } from "express";
import friendshipsController from "../controllers/friendshipsController.js"

const friendshipsRouter: Router = Router();

// api/status
friendshipsRouter.put('/', friendshipsController.updateFriendship);
friendshipsRouter.get('/status', friendshipsController.getFriendshipStatus);


export default friendshipsRouter;
