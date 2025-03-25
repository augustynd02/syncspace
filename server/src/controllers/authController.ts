import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/CustomError.js";
import generateAccessToken from "../utils/generateAccessToken.js";

const prisma = new PrismaClient();

const authController = {
    loginUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;

            const user = await prisma.user.findUnique({
                where: { username: username }
            })

            if (!user) {
                throw new CustomError(401, 'Invalid username');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid) {
                throw new CustomError(401, 'Invalid password');
            }

            const token = generateAccessToken(String(user.id));

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: 'none',
                secure: process.env.NODE_ENV === 'production'
            });
            res.status(200).json({ message: 'Login successful', user: { id: user.id }})
        } catch (err) {
            next(err)
        }
    },

    logoutUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.cookies.token) {
                res.status(400).json({ message: "No active session found" });
                return;
            }
            res.clearCookie('token');
            res.status(205).json({ message: 'Logout successful.' });
        } catch (err) {
            next(err);
        }
    }
}

export default authController;
