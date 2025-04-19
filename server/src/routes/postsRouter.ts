import { Router } from "express";
import postsController from "../controllers/postsController.js";
import multer from 'multer';

const postsRouter: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

// api/posts
postsRouter.post('/', upload.single('postImage'), postsController.createPost);
postsRouter.get('/feed', postsController.getFeed);
postsRouter.post('/:post_id/likes', postsController.likePost);
postsRouter.delete('/:post_id/likes', postsController.dislikePost);
postsRouter.post('/:post_id/comments', postsController.createComment);
postsRouter.post('/:post_id/comments/:comment_id/likes', postsController.likeComment);
postsRouter.delete('/:post_id/comments/:comment_id/likes', postsController.dislikeComment);

export default postsRouter;
