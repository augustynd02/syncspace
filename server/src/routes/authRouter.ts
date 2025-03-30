import { Router } from "express";
import authController from "../controllers/authController.js";

const authRouter: Router = Router();

// api/auth
authRouter.get('/', authController.getAuthStatus);
authRouter.post('/login', authController.loginUser);
authRouter.post('/logout', authController.logoutUser);

export default authRouter;
