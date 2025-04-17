import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { getImageUrl, postImage } from '../lib/s3.js';


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

const postsController = {
    getFeed: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const id = parseInt(req.user_id);

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

            const feed = await prisma.post.findMany({
                where: {
                    user_id: {
                        in: friendIds
                    },
                },
                select: {
                    id: true,
                    message: true,
                    image_name: true,
                    created_at: true,
                    user_id: false,
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
                            likes: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                }
            }) as Post[];

            for (const post of feed) {
                if (post.image_name) {
                    post.imageUrl = await getImageUrl(post.image_name);
                }
                post.user.avatar_url = await getImageUrl(post.user.avatar_name);
                post.hasLiked = post.likes.some(like => like.user_id === id);
            }

            res.status(200).json({ feed: feed });
        } catch (err) {
            next(err);
        }
    },
    createPost: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user_id;

            if (!id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const randomImageName = crypto.randomBytes(16).toString('hex');

            if (req.file) {
                try {
                    await postImage(randomImageName, req.file);
                } catch(err: any) {
                    res.status(500).json({ message: "Error uploading file to S3", error: err.message });
                    return;
                }
            }

            const post = await prisma.post.create({
                data: {
                    message: req.body.postMessage,
                    image_name: req.file ? randomImageName : null,
                    user_id: parseInt(id)
                }
            })

            res.status(201).json({
                message: "Post created successfully"
            })
        } catch (err) {
            next(err)
        }
    },
    likePost: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const post_id = parseInt(req.params.post_id);
            const user_id = parseInt(req.user_id);

            const like = await prisma.like.findFirst({
                where: {
                    user_id: user_id,
                    post_id: post_id
                }
            })

            if (like) {
                res.status(400).json({ message: "Post is already liked" });
                return;
            }

            const newLike = await prisma.like.create({
                data: {
                    user_id: user_id,
                    post_id: post_id
                }
            })

            res.status(200).json({ like: newLike });
        } catch (err) {
            next(err)
        }
    },
    dislikePost: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const post_id = parseInt(req.params.post_id);
            const user_id = parseInt(req.user_id);

            const like = await prisma.like.findFirst({
                where: {
                    user_id: user_id,
                    post_id: post_id
                }
            })

            if (!like) {
                res.status(400).json({ message: "Like does not exist" });
                return;
            }

            await prisma.like.deleteMany({
                where: {
                    AND: [
                        { user_id: user_id},
                        { post_id: post_id }
                    ]
                }
            })

            res.status(200).json({ message: "Like removed" });
        } catch (err) {
            next(err);
        }
    }
}

export default postsController;
