import { Router } from "express";
import postsController from "../controllers/postsController.js";
import multer from 'multer';
import rateLimit from 'express-rate-limit';

const postsRouter: Router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: { message: 'Too many uploads, please try again later.' }
})

// api/posts
postsRouter.get('/', postsController.getPosts);
postsRouter.post('/', uploadLimiter, upload.single('postImage'), postsController.createPost);
postsRouter.get('/feed', postsController.getFeed);
postsRouter.get('/:post_id', postsController.getPost);
postsRouter.delete('/:post_id', postsController.deletePost);
postsRouter.post('/:post_id/likes', postsController.likePost);
postsRouter.delete('/:post_id/likes', postsController.dislikePost);
postsRouter.post('/:post_id/comments', postsController.createComment);
postsRouter.delete('/:post_id/comments/:comment_id', postsController.deleteComment);
postsRouter.post('/:post_id/comments/:comment_id/likes', postsController.likeComment);
postsRouter.delete('/:post_id/comments/:comment_id/likes', postsController.dislikeComment);

export default postsRouter;
