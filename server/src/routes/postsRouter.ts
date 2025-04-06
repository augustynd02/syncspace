import { Router } from "express";
import postsController from "../controllers/postsController.js";
import multer from 'multer';

const postsRouter: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// api/posts
postsRouter.post('/', upload.single('postImage'), postsController.createPost);
postsRouter.get('/feed', postsController.getFeed)

export default postsRouter;
