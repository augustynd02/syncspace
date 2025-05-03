import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import Express, { Request, Response, NextFunction } from "express";
import { getImageUrl, postImage } from "../lib/s3.js";
import crypto from "crypto";

import Post from "../../types/Post.js";
import User from "../../types/User.js";

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
                    last_name: req.body.last_name,
                    avatar_name: 'avatar_placeholder',
                    background_name: 'background_placeholder'
                }
            })

            const createdUser = await prisma.user.findUnique({
                where: {
                    username: req.body.username
                }
            })

            if (!createdUser) {
                res.status(404).json({ message: "Could not get the created user from the database" });
                return;
            }

            await prisma.notification.create({
                data: {
                    sender_id: createdUser.id,
                    recipient_id: createdUser.id,
                    type: 'info',
                    message: "Welcome to syncspace - a space to synchronize with others. A few default accounts were added to your friend list to get you started. Make sure to explore and interact with others!"
                }
            })

            const startingAccount1 = await prisma.user.findUnique({
                where: {
                    username: 'yurishe'
                }
            })

            const startingAccount2 = await prisma.user.findUnique({
                where: {
                    username: 'yurishe2'
                }
            })

            const startingAccount3 = await prisma.user.findUnique({
                where: {
                    username: 'yurishe3'
                }
            })

            if (startingAccount1) {
                await prisma.friendship.create({
                    data: {
                        requester_id: startingAccount1.id,
                        receiver_id: createdUser.id,
                        status: 'accepted'
                    }
                })
            }

            if (startingAccount2) {
                await prisma.friendship.create({
                    data: {
                        requester_id: startingAccount2.id,
                        receiver_id: createdUser.id,
                        status: 'accepted'
                    }
                })
            }

            if (startingAccount3) {
                await prisma.friendship.create({
                    data: {
                        requester_id: startingAccount3.id,
                        receiver_id: createdUser.id,
                        status: 'pending'
                    }
                })

                await prisma.notification.create({
                    data: {
                        sender_id: startingAccount3.id,
                        recipient_id: createdUser.id,
                        type: 'friend_request',
                        message: `${startingAccount3.name} ${startingAccount3.last_name} has sent you a friend request.`
                    }
                })
            }

            res.status(201).json({
                message: "User registered successfully"
            })
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                res.status(409).json({ message: "Username already in use"});
                return;
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
                        avatar_name: true,
                        bio: true,
                    }
                }) as User[]
            } else {
                users = await prisma.user.findMany() as User[];
            }

            for (const user of users) {
                user.avatar_url = await getImageUrl(user.avatar_name);
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
                res.status(401).json({ message: "Not authenticated"})
                return;
            }

            if (req.user_id !== id) {
                res.status(403).json({ message: "Not authorized"});
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
                res.status(401).json({ message: "No fields to update"});
                return;
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
            res.status(401).json({ message: "Not authenticated"});
            return;
        }

        if (req.user_id !== id) {
            res.status(403).json({ message: "Not authorized"});
            return;
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
                res.status(401).json({ message: "Not authenticated"});
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
    },
    getRandomUsers: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authenticated"})
                return;
            }

            const userId = parseInt(req.user_id);

            const friendships = await prisma.friendship.findMany({
                where: {
                    OR: [
                        { requester_id: userId },
                        { receiver_id: userId }
                    ],
                    AND: [
                        { status: 'accepted' }
                    ]
                },
                select: {
                    requester: { select: { id: true } },
                    receiver: { select: { id: true } }
                }
            });

            const friendIds = friendships.map(friendship =>
                friendship.requester.id === userId ? friendship.receiver.id : friendship.requester.id
            );

            friendIds.push(userId);

            const randomUsers = await prisma.user.findMany({
                where: {
                    id: {
                        notIn: friendIds
                    }
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                    avatar_name: true,
                    bio: true,
                },
                take: 5,
                orderBy: {
                    id: 'asc'
                }
            }) as User[];

            const shuffledUsers = randomUsers
                .sort(() => Math.random() - 0.5)
                .slice(0, 5);

            for (const user of shuffledUsers) {
                user.avatar_url = await getImageUrl(user.avatar_name);
            }

            res.status(200).json({ users: shuffledUsers });
        } catch (err) {
            next(err);
        }
    }
}

export default usersController;
