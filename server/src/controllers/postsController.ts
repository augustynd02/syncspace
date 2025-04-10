import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { getImageUrl, postImage } from '../lib/s3.js';

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

const postsController = {
    getFeed: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user_id;

            if (!id) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const friendships = await prisma.friendship.findMany({
                where: {
                    OR: [
                        {
                            requester_id: parseInt(id)
                        },
                        {
                            receiver_id: parseInt(id)
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
                return friendship.requester.id === parseInt(id) ? friendship.receiver.id : friendship.requester.id;
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
            }

            return res.status(200).json({ feed: feed });
        } catch (err) {
            next(err);
        }
    },
    createPost: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user_id;

            if (!id) {
                return res.status(401).json({ message: "Not authenticated" });
            }

            const randomImageName = crypto.randomBytes(16).toString('hex');

            if (req.file) {
                try {
                    await postImage(randomImageName, req.file);
                } catch(err: any) {
                    return res.status(500).json({ message: "Error uploading file to S3", error: err.message });
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
    }
}

export default postsController;
