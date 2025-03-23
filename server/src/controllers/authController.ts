import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

const authController = {
    registerUser: async (req: Request, res: Response, next: NextFunction) => {
        res.send('register');
    },

    loginUser: async (req: Request, res: Response, next: NextFunction) => {
        res.send('login');
    },

    logoutUser: async (req: Request, res: Response, next: NextFunction) => {
        res.send('logout');
    }
}

export default authController;
