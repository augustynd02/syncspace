import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { getImageUrl, postImage } from '../lib/s3.js';

import Post from "../types/Post.js";

interface RequestWithQuery extends Request {
    query: {
        q?: string;
    }
}

const prisma = new PrismaClient();

const postsController = {
    getPosts: async (req: RequestWithQuery, res: Response, next: NextFunction) => {
        const query = req.query.q;
        const user_id = req.user_id ? parseInt(req.user_id) : null;
        let posts;

        if (query) {
            posts = await prisma.post.findMany({
                where: {
                    message: { contains: query, mode: 'insensitive'}
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
                },
            }) as Post[]

        } else {
            posts = await prisma.post.findMany({
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
                },
            }) as Post[]
        }

        for (const post of posts) {
            if (post.image_name) {
                post.imageUrl = await getImageUrl(post.image_name);
            }
            post.user.avatar_url = await getImageUrl(post.user.avatar_name);
            if (user_id) {
                post.hasLiked = post.likes.some(like => like.user_id === user_id);
            }
            for (const comment of post.comments) {
                comment.user.avatar_url = await getImageUrl(comment.user.avatar_name);
                if (user_id) {
                    comment.hasLiked = comment.likes.some(like => like.user_id === user_id);
                }
            }
        }

         res.status(200).json({ posts: posts });
        return;
    },
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
                for (const comment of post.comments) {
                    comment.user.avatar_url = await getImageUrl(comment.user.avatar_name);
                    comment.hasLiked = comment.likes.some(like => like.user_id === id);
                }
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
    getPost: async (req: Request, res: Response, next: NextFunction) => {
        const post_id = parseInt(req.params.post_id);
        const user_id = req.user_id ? parseInt(req.user_id) : null;

        const post = await prisma.post.findUnique({
            where: {
                id: post_id
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
            },
        }) as Post;

        if (!post) {
            res.status(404).json({ message: "Post not found" });
            return
        }
        post.user.avatar_url = await getImageUrl(post.user.avatar_name);
        post.hasLiked = user_id !== null
            ? post.likes.some(like => like.user_id === user_id)
            : false;

        for (const comment of post.comments) {
            comment.user.avatar_url = await getImageUrl(comment.user.avatar_name);
            comment.hasLiked = user_id !== null
                ? comment.likes.some(like => like.user_id === user_id)
                : false;
        }

        res.status(200).json({ post: post });
    },
    deletePost: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized"});
                return;
            }

            const post_id = parseInt(req.params.post_id);
            const user_id = parseInt(req.user_id);

            const post = await prisma.post.findUnique({
                where: {
                    id: post_id
                }
            })

            if (!post) {
                res.status(404).json({ message: "Post not found"});
                return;
            }

            if (post.user_id !== user_id) {
                res.status(403).json({ message: "Forbidden"});
                return;
            }

            const deletedPost = await prisma.post.delete({
                where: {
                    id: post_id
                }
            })

            res.status(200).json({ message: "Post successfully deleted" });
            return;
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

            const sender = await prisma.user.findUnique({
                where: {
                    id: user_id
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                }
            })

            if (!sender) {
                res.status(404).json({ message: "Sender not found" });
                return;
            }

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

            const post = await prisma.post.findUnique({
                where: {
                    id: post_id
                }
            })

            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            if(post.user_id !== user_id) {
                await prisma.notification.create({
                    data: {
                        recipient_id: post.user_id,
                        sender_id: user_id,
                        post_id: post.id,
                        type: 'like',
                        message: `${sender.name} ${sender.middle_name ? sender.middle_name : ''} ${sender.last_name} has liked your post.`
                    }
                })
            }


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
    },
    createComment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const post_id = parseInt(req.params.post_id);
            const user_id = parseInt(req.user_id);

            const sender = await prisma.user.findUnique({
                where: {
                    id: user_id
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                }
            })

            if (!sender) {
                res.status(404).json({ message: "Sender not found" });
                return;
            }

            const post = await prisma.post.findUnique({
                where: {
                    id: post_id
                }
            })

            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            const comment = await prisma.comment.create({
                data: {
                    content: req.body.commentMessage,
                    post_id: post_id,
                    user_id: user_id,
                }
            })

            const notification = await prisma.notification.create({
                data: {
                    recipient_id: post.user_id,
                    sender_id: user_id,
                    post_id: post.id,
                    type: 'comment',
                    message: `${sender.name} ${sender.middle_name ? sender.middle_name : ''} ${sender.last_name} has commented on your post.`
                }
            })

            res.status(200).json({ comment: comment});
        } catch (err) {
            next(err);
        }
    },
    deleteComment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authenticated" });
                return;
            }

            const user_id = parseInt(req.user_id);
            const comment_id = parseInt(req.params.comment_id);

            const comment = await prisma.comment.findFirst({
                where: {
                    id: comment_id,
                }
            })

            if (!comment) {
                res.status(404).json({ message: "Comment not found" });
                return;
            }

            if (user_id !== comment.user_id) {
                res.status(403).json({ message: "Not authorized"});
                return;
            }

            await prisma.comment.delete({
                where: {
                    id: comment_id
                }
            })

            res.status(200).json({ message: "Comment deleted" });
        } catch(err) {
            next(err);
        }
    },
    likeComment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const comment_id = parseInt(req.params.comment_id);
            const user_id = parseInt(req.user_id);

            const sender = await prisma.user.findUnique({
                where: {
                    id: user_id
                },
                select: {
                    id: true,
                    name: true,
                    middle_name: true,
                    last_name: true,
                }
            })

            if (!sender) {
                res.status(404).json({ message: "Sender not found" });
                return;
            }

            const comment = await prisma.comment.findUnique({
                where: {
                    id: comment_id
                }
            })

            if (!comment) {
                res.status(404).json({ message: "Comment not found" })
                return;
            }

            const post = await prisma.post.findUnique({
                where: {
                    id: comment.post_id
                }
            })

            if (!post) {
                res.status(404).json({ message: "Post not found" })
                return;
            }

            const like = await prisma.like.findFirst({
                where: {
                    user_id: user_id,
                    comment_id: comment_id
                }
            })

            if (like) {
                res.status(400).json({ message: "Post is already liked" });
                return;
            }

            const newLike = await prisma.like.create({
                data: {
                    user_id: user_id,
                    comment_id: comment_id
                }
            })

            if (comment.user_id !== user_id) {
                await prisma.notification.create({
                    data: {
                        recipient_id: comment.user_id,
                        sender_id: user_id,
                        post_id: post.id,
                        type: 'like',
                        message: `${sender.name} ${sender.middle_name ? sender.middle_name : ''} ${sender.last_name} has liked your comment.`
                    }
                })

            }


            res.status(200).json({ like: newLike });
        } catch (err) {
            next(err)
        }
    },
    dislikeComment: async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user_id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            const user_id = parseInt(req.user_id);
            const comment_id = parseInt(req.params.comment_id);

            const like = await prisma.like.findFirst({
                where: {
                    user_id: user_id,
                    comment_id: comment_id
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
                        { comment_id: comment_id },
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
