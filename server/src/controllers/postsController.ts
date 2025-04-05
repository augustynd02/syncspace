import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

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

            console.log(`FRIEND IDS: ${friendIds}`);

            const feed = await prisma.post.findMany({
                where: {
                    user_id: {
                        in: friendIds
                    },
                },
                select: {
                    id: true,
                    title: true,
                    message: true,
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
            })
            return res.status(200).json({ feed: feed });
        } catch (err) {
            next(err);
        }
    }
}

export default postsController;
