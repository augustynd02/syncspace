import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express"
import CustomError from "../utils/CustomError.js";

interface RequestWithQuery extends Request {
	query: {
		user1: string;
		user2: string;
	}
}

interface Friendship {
	requester_id: number;
	receiver_id: number;
	status: 'accepted' | 'pending' | 'declined'
}

const prisma = new PrismaClient();

const friendshipsController = {
	getFriendshipStatus: async (req: RequestWithQuery, res: Response, next: NextFunction) => {
		try {
			const { user1, user2 } = req.query;
			const user1Id = parseInt(user1);
			const user2Id = parseInt(user2);

			const friendship = await prisma.friendship.findFirst({
				where: {
					OR: [
						{
							requester_id: user1Id,
							receiver_id: user2Id
						},
						{
							requester_id: user2Id,
							receiver_id: user1Id
						}
					]
				},
			}) as Friendship;

			res.status(200).json({ friendship });
		} catch (err) {
			next(err);
		}
	},
	updateFriendship: async (req: RequestWithQuery, res: Response, next: NextFunction) => {
		try {
			const { user1, user2 } = req.query;

			if (!req.user_id || req.user_id != user1 && req.user_id != user2) {
				return next(new CustomError(401, "User not authorized to update this friendship"))
			}

			const user1Id = parseInt(user1);
			const user2Id = parseInt(user2);

			const requesterId = parseInt(req.user_id);
			const receiverId = user1Id === parseInt(req.user_id) ? user2Id : user1Id;

			const friendship = await prisma.friendship.findFirst({
				where: {
					OR: [
						{
							requester_id: user1Id,
							receiver_id: user2Id
						},
						{
							requester_id: user2Id,
							receiver_id: user1Id
						}
					]
				},
			}) as Friendship;

			if (!friendship) {
				const updatedFriendship = await prisma.friendship.create({
					data: {
						requester_id: requesterId,
						receiver_id: receiverId,
						status: 'pending'
					}
				})

				const notification = await prisma.notification.create({
					data: {
						message: "New friend request",
						type: "friend_request",
						sender_id: requesterId,
						recipient_id: receiverId
					}
				})

				res.status(200).json({ friendship: updatedFriendship });
				return;
			}

			if (friendship.status === 'accepted') {
				await prisma.friendship.deleteMany({
					where: {
						OR: [
							{
								requester_id: user1Id,
								receiver_id: user2Id
							},
							{
								requester_id: user2Id,
								receiver_id: user1Id
							}
						]
					},
				})

				const updatedFriendship = await prisma.friendship.findFirst({
					where: {
					  OR: [
						{ requester_id: user1Id, receiver_id: user2Id },
						{ requester_id: user2Id, receiver_id: user1Id },
					  ],
					},
				  });

				res.status(200).json({ friendship: updatedFriendship });
				return;
			}

			if (friendship.status === 'pending' && friendship.requester_id === requesterId) {
				await prisma.friendship.deleteMany({
					where: {
						OR: [
							{
								requester_id: user1Id,
								receiver_id: user2Id
							},
							{
								requester_id: user2Id,
								receiver_id: user1Id
							}
						]
					},
				})


				res.status(200).json({ friendship: undefined });
				return;
			}

			if (friendship.status === 'pending' && friendship.receiver_id === requesterId) {
				await prisma.friendship.updateMany({
					where: {
						OR: [
							{
								requester_id: user1Id,
								receiver_id: user2Id
							},
							{
								requester_id: user2Id,
								receiver_id: user1Id
							}
						]
					},
					data: {
						status: 'accepted'
					}
				})

				const updatedFriendship = await prisma.friendship.findFirst({
					where: {
					  OR: [
						{ requester_id: user1Id, receiver_id: user2Id },
						{ requester_id: user2Id, receiver_id: user1Id },
					  ],
					},
				  });

				const notification = await prisma.notification.create({
					data: {
						message: `"Friend request accepted"`,
						type: "friend_request",
						sender_id: requesterId,
						recipient_id: receiverId
					}
				})

				res.status(200).json({ friendship: updatedFriendship });
				return;
			}
		} catch (err) {
			next(err)
		}
    }
}

export default friendshipsController
