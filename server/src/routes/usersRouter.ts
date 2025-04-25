import { Router } from "express";
import usersController from "../controllers/usersController.js";
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const usersRouter: Router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { message: 'Too many uploads, please try again later.' }
})

// api/users
usersRouter.post('/', usersController.createUser);
usersRouter.get('/', usersController.getUsers);
usersRouter.get('/me', usersController.getCurrentUser);
usersRouter.get('/random', usersController.getRandomUsers);
usersRouter.get('/:id', usersController.getUserById);
usersRouter.put('/:id', uploadLimiter, upload.fields([ {name: 'background_file'}, {name: 'avatar_file'}]), usersController.editUser);
usersRouter.get('/:id/friends', usersController.getFriends);
usersRouter.delete('/:id', usersController.deleteUser);
usersRouter.get('/:id/posts', usersController.getUserPosts);

export default usersRouter;
