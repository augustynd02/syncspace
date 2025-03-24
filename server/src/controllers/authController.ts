import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

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

            if (!user) {
                return next(new Error("Could not register user."))
            }

            res.status(201).json({
                message: "User registered successfully"
            })
        } catch (err) {
            next(err);
        }
    },

    loginUser: async (req: Request, res: Response, next: NextFunction) => {
        res.send('login');
    },

    logoutUser: async (req: Request, res: Response, next: NextFunction) => {
        res.send('logout');
    }
}

export default authController;
