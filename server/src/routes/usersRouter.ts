import { Router } from "express";
import usersController from "../controllers/usersController.js";

const usersRouter: Router = Router();

// api/user
usersRouter.get('/', usersController.getUsers);

export default usersRouter;
