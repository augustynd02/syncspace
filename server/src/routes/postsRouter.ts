import { Router } from "express";
import postsController from "../controllers/postsController.js";

const postsRouter: Router = Router();

// api/posts
postsRouter.get('/feed', postsController.getFeed)

export default postsRouter;
