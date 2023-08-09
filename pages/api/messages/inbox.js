// pages/api/message/index.js

import asyncHandler from '@/middlewares/asyncHandler';
import authMiddleware from '@/middlewares/authMiddleware';
import { prisma } from '@/lib/db';
import { userHelper } from '@/lib/helper';

const getMessages = authMiddleware(async (req, res) => {
	// Id of current user
	const { id: receiverId } = req.user;
	// Fetch all messages where the receiverId and senderId match
	const messages = await prisma.message.findMany({
		where: {
			receiverId,
		},
		include: {
			sender: {
				select: userHelper,
			},
			receiver: {
				select: userHelper,
			},
		},
		orderBy: { createdAt: 'desc' },
		distinct: ['senderId'],
	});
	res.status(200).json(messages);
});

const handler = asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'GET':
			await getMessages(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});

export default handler;
