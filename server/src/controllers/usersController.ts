import { PrismaClient } from "@prisma/client";
import CustomError from "../utils/CustomError.js";
import e, { Request, Response, NextFunction } from "express";

interface RequestWithQuery extends Request {
    query: {
        q?: string;
    }
}

const prisma = new PrismaClient();

const usersController = {
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
}

export default usersController;
