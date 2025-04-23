import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/CustomError.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import { getImageUrl } from "../lib/s3.js";

type User = {
    id: number;
    username: string;
    password: string;
    name: string;
    middle_name?: string;
    last_name: string;
    bio?: string;
    avatar_name: string;
    background_name: string;
    avatar_url?: string;
    background_url?: string;
}

const prisma = new PrismaClient();

const authController = {
    getAuthStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user_id) {
                res.status(200).json({ user_id: req.user_id });
                return;
            }
            res.status(401).json({ message: "Not authenticated" });
            return;
        } catch (error) {
            next(error);
        }
    },
    loginUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { username, password } = req.body;

            const user = await prisma.user.findUnique({
                where: { username: username },
                select: {
                    id: true,
                    password: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                    bio: true,
                    avatar_name: true,
                    background_name: true,
                }
            }) as User;

            if (!user) {
                throw new CustomError(401, 'Invalid username');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid) {
                throw new CustomError(401, 'Invalid password');
            }


            user.avatar_url = await getImageUrl(user.avatar_name);
            user.background_url = await getImageUrl(user.background_name);

            const { password: userPassword, ...userWithoutPassword } = user;

            const token = generateAccessToken(String(user.id));

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/'
            });
            res.status(200).json({ message: 'Login successful', user: userWithoutPassword})
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
