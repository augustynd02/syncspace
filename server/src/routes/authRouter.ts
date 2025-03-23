import authController from "../controllers/authController.js";
import { Router } from "express";
const authRouter = Router();

// api/auth
authRouter.post('/login', authController.loginUser);
authRouter.post('/logout', authController.logoutUser);
authRouter.post('/register', authController.registerUser);

export default authRouter;
