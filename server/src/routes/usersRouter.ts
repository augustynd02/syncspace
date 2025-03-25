import { Router } from "express";
import usersController from "../controllers/usersController.js";

const usersRouter: Router = Router();

// api/users
usersRouter.post('/', usersController.createUser);
usersRouter.get('/', usersController.getUsers);
usersRouter.get('/:id', usersController.getUserById);
usersRouter.put('/:id', usersController.editUser);
usersRouter.delete('/:id', usersController.deleteUser);

export default usersRouter;
