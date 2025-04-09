import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import CustomError from "../utils/CustomError.js";
import { Request, Response, NextFunction } from "express";
import { getImageUrl } from "../lib/s3.js";

interface RequestWithQuery extends Request {
    query: {
        q?: string;
    }
}

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

type Post = {
    id: number;
    message: string;
    image_name: string | null;
    created_at: Date;
    user: {
      id: number;
      name: string;
      middle_name: string | null;
      last_name: string;
    };
    imageUrl?: string;
  };

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
                    last_name: req.body.last_name,
                    avatar_name: 'avatar_placeholder',
                    background_name: 'background_placehodler'
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
                users = await prisma.user.findMany({
                    where: {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { middle_name: { contains: query, mode: "insensitive" } },
                            { last_name: { contains: query, mode: "insensitive" } }
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        middle_name: true,
                        last_name: true,
                        bio: true,
                    }
                })
            } else {
                users = await prisma.user.findMany();
            }

            res.status(200).json({ users: users });
        } catch (err) {
            next(err);
        }
    },
    getUserById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            const user = await prisma.user.findUnique({
                where: {
                    id: id
                }, select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                    bio: true,
                    avatar_name: true,
                    background_name: true,
                }
            }) as User;

            if (!user) {
                res.status(404).json({ message: 'User could not be found.'});
                return;
            }

            user.avatar_url = await getImageUrl(user.avatar_name);
            user.background_url = await getImageUrl(user.background_name);

            res.status(200).json({ user });
        } catch (err) {
            next(err);
        }
    },
    editUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, middle_name, last_name, bio } = req.body;
            const id = req.params.id;

            if (!req.user_id) {
                return next(new CustomError(401, "Not authenticated"))
            }

            if (req.user_id !== id) {
                return next(new CustomError(403, "Not authorized to perform this operation"));
            }

            if (!name || !last_name) {
                return next(new CustomError(400, "Missing required fields"));
            }

            const user = await prisma.user.update({
                where: {
                    id: parseInt(id)
                },
                data: {
                    name: name,
                    middle_name: middle_name,
                    last_name: last_name,
                    bio: bio,
                },
            })

            res.status(200).json({ message: "User updated successfully" });
        } catch (err) {
            next(err)
        }
    },
    deleteUser: async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params.id;
        if (!req.user_id) {
            return next(new CustomError(401, "Not authenticated"))
        }

        if (req.user_id !== id) {
            return next(new CustomError(403, "Not authorized to perform this operation"))
        }

        const user = await prisma.user.delete({
            where: {
                id: parseInt(id)
            }
        })

        res.status(200).json({ message: "User deleted successfully " });
    },
    getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user_id;

            if (!id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: parseInt(id)
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                    bio: true,
                }
            })

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.status(200).json({ user: user });
        } catch (err) {
            next(err)
        }
    },
    getUserPosts: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            const posts = await prisma.post.findMany({
                where: {
                    user_id: id
                },
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    user: true
                }
            }) as Post[]

            for (const post of posts) {
                if (post.image_name) {
                    post.imageUrl = await getImageUrl(post.image_name);
                }
            }

            res.status(200).json({ posts: posts });
        } catch (err) {
            next(err);
        }
    }
}

export default usersController;
