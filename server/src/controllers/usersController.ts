import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import CustomError from "../utils/CustomError.js";
import e, { Request, Response, NextFunction } from "express";

interface RequestWithQuery extends Request {
    query: {
        q?: string;
    }
}

const prisma = new PrismaClient();

const usersController = {
    createUser: async (req: Request, res: Response, next: NextFunction) => {
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

    getUsers: async (req: RequestWithQuery, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q;

            let users;

            if (query) {
                users = prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: "insensitive" }},
                            { middle_name: {contains: query, mode: "insensitive" }},
                            { last_name: {contains: query, mode: "insensitive" }}
                        ]
                    }
                })
            } else {
                users = prisma.user.findMany();
            }

            res.status(200).json({ users });
        } catch (err) {
            next(err);
        }
    },
    getUserById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            const user = prisma.user.findUnique({
                where: {
                    id: id
                }
            })

            res.status(200).json({ user });
        } catch (err) {
            next(err);
        }
    }
}

export default usersController;
