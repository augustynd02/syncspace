import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/CustomError.js";
import generateAccessToken from "../utils/generateAccessToken.js";

const prisma = new PrismaClient();

const authController = {
    registerUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body.password = await bcrypt.hash(req.body.password, 10);

            const user = await prisma.user.create({
                data: {
                    username: req.body.username,
                    password: req.body.password,
                    name: req.body.name,
                    ...(req.body.middle_name && { middle_name: req.body.middle_name }),
                    last_name: req.body.last_name
                }
            })

            res.status(201).json({
                message: "User registered successfully"
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                next(new CustomError(409, 'This username is already taken.'));
            }
            next(err);
        }
    },

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
