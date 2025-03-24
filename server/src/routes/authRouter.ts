import { Router } from "express";
import authController from "../controllers/authController.js";

const authRouter: Router = Router();

// api/auth
authRouter.post('/login', authController.loginUser);
authRouter.post('/logout', authController.logoutUser);
authRouter.post('/register', authController.registerUser);

export default authRouter;
