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

            const feed = await prisma.post.findMany({
                where: {
                    id: {
                        in: friendIds
                    }
                }
            })
            return res.status(200).json({ feed: feed });
        } catch (err) {
            next(err);
        }
    }
}

export default postsController;
