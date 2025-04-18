import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import CustomError from "../utils/CustomError.js";
import Express, { Request, Response, NextFunction } from "express";
import { getImageUrl, postImage } from "../lib/s3.js";
import crypto from "crypto";

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

interface Like {
    id: number;
    user_id: number;
    post_id: number;
    liked_at: Date;
}

interface Comment {
    id: number;
    content: string;
    user_id: number;
    post_id: number;
    created_at: Date;
    likes: Like[]
    user: {
        id: number;
        name: string;
        middle_name: string | null;
        last_name: string;
        avatar_name: string;
        avatar_url?: string;
    };
    hasLiked?: boolean;
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
        avatar_name: string;
        avatar_url?: string;
    };
    imageUrl?: string;
    hasLiked?: boolean;
    likes: Like[];
    comments: Comment[];
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
                    background_name: 'background_placeholder'
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
                res.status(404).json({ message: 'User could not be found.' });
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
            const id = req.params.id;

            if (!req.user_id) {
                next(new CustomError(401, "Not authenticated"));
                return;
            }

            if (req.user_id !== id) {
                next(new CustomError(403, "Not authorized to perform this operation"));
                return;
            }

            const randomImageName = crypto.randomBytes(16).toString('hex');

            if (req.files && !Array.isArray(req.files)) {
                if (req.files.avatar_file) {
                    try {
                        await postImage(randomImageName, req.files.avatar_file[0]);
                        req.body.avatar_name = randomImageName;
                    } catch (err: any) {
                        res.status(500).json({ message: "Error uploading file to S3", error: err.message });
                        return;
                    }
                } else if (req.files.background_file && req.files.background_file[0]) {
                    try {
                        await postImage(randomImageName, req.files.background_file[0]);
                        req.body.background_name = randomImageName;
                    } catch (err: any) {
                        res.status(500).json({ message: "Error uploading file to S3", error: err.message });
                        return;
                    }
                }
            }

            const allowedFields = [
                'username',
                'password',
                'name',
                'middle_name',
                'last_name',
                'bio',
                'avatar_name',
                'background_name'
            ];

            const updateData: Record<string, any> = {};
            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            }

            if (Object.keys(updateData).length === 0) {
                throw new CustomError(401, 'No fields to update');
            }

            const updatedUser = await prisma.user.update({
                where: {
                    id: parseInt(id)
                },
                data: updateData
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
                    avatar_name: true,
                    background_name: true,
                }
            }) as User;

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            user.avatar_url = await getImageUrl(user.avatar_name);
            user.background_url = await getImageUrl(user.background_name);

            res.status(200).json({ user: user });
        } catch (err) {
            next(err)
        }
    },
    getUserPosts: async (req: Request, res: Response, next: NextFunction) => {
        try {

            if (!req.user_id) {
                next(new CustomError(401, 'Not authenticated'));
                return;
            }
            const id = parseInt(req.params.id);

            const posts = await prisma.post.findMany({
                where: {
                    user_id: id
                },
                orderBy: {
                    created_at: 'desc'
                },
                select: {
                    id: true,
                    message: true,
                    image_name: true,
                    created_at: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            middle_name: true,
                            last_name: true,
                            avatar_name: true,
                        }
                    },
                    likes: true,
                    comments: {
                        include: {
                            likes: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    middle_name: true,
                                    last_name: true,
                                    avatar_name: true,
                                }
                            }
                        }
                    }
                }
            }) as Post[]

            for (const post of posts) {
                if (post.image_name) {
                    post.imageUrl = await getImageUrl(post.image_name);
                }
                post.user.avatar_url = await getImageUrl(post.user.avatar_name);
                post.hasLiked = post.likes.some(like => like.user_id === parseInt(req.user_id as string));
                for (const comment of post.comments) {
                    comment.user.avatar_url = await getImageUrl(comment.user.avatar_name);
                    comment.hasLiked = comment.likes.some(like => like.user_id === id);
                }
            }

            res.status(200).json({ posts: posts });
        } catch (err) {
            next(err);
        }
    },
    getFriends: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = parseInt(req.params.id);

            const friendships = await prisma.friendship.findMany({
                where: {
                    OR: [
                        {
                            requester_id: id
                        },
                        {
                            receiver_id: id
                        }
                    ],
                    AND: [
                        {
                            status: 'accepted'
                        }
                    ]
                },
                select: {
                    requester: {
                        select: {
                            id: true,
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                        }
                    }
                }
            })

            const friendIds = friendships.map(friendship => {
                return friendship.requester.id === id ? friendship.receiver.id : friendship.requester.id;
            })

            const friends = await prisma.user.findMany({
                where: {
                    id: {
                        in: friendIds
                    }
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                    avatar_name: true,
                }
            }) as User[]

            for (const friend of friends) {
                friend.avatar_url = await getImageUrl(friend.avatar_name);
            }

            res.status(200).json({ friends: friends });
        } catch (err) {
            next(err);
        }
    }
}

export default usersController;
