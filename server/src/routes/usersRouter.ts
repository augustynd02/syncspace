import { Router } from "express";
import usersController from "../controllers/usersController.js";
import multer from 'multer';

const usersRouter: Router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// api/users
usersRouter.post('/', usersController.createUser);
usersRouter.get('/', usersController.getUsers);
usersRouter.get('/me', usersController.getCurrentUser);
usersRouter.get('/:id', usersController.getUserById);
usersRouter.put('/:id', upload.fields([ {name: 'background_file'}, {name: 'avatar_file'}]), usersController.editUser);
usersRouter.get('/:id/friends', usersController.getFriends);
usersRouter.delete('/:id', usersController.deleteUser);
usersRouter.get('/:id/posts', usersController.getUserPosts);

export default usersRouter;
