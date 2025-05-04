import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import generateAccessToken from "../utils/generateAccessToken.js";
import { getImageUrl } from "../lib/s3.js";
import jwt from "jsonwebtoken";

import User from "../types/User.js";

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
                res.status(401).json({ message: 'Invalid username'});
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(!isPasswordValid) {
                res.status(401).json({ message: 'Invalid password'});
                return;
            }


            user.avatar_url = await getImageUrl(user.avatar_name);
            user.background_url = await getImageUrl(user.background_name);

            const { password: userPassword, ...userWithoutPassword } = user;

            const token = generateAccessToken(String(user.id));

            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
            });
            res.status(200).json({ message: 'Login successful', user: userWithoutPassword})
        } catch (err) {
            next(err)
        }
    },

    logoutUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('logging out');
            console.log(req.cookies.token);
            if (!req.cookies.token) {
                res.status(400).json({ message: "No active session found" });
                return;
            }
            res.clearCookie('token');
            res.status(205).json({ message: 'Logout successful.' });
        } catch (err) {
            next(err);
        }
    },

    getWsToken: async (req: Request, res: Response, next: NextFunction) => {
        const wsToken = jwt.sign(
            { id: req.user_id, purpose: 'websocket' },
            process.env.TOKEN_SECRET!,
            { expiresIn: '1h' }
          );

          res.json({ token: wsToken });
    }
}

export default authController;
