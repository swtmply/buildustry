// pages/api/message/index.js

import asyncHandler from '@/middlewares/asyncHandler';
import authMiddleware from '@/middlewares/authMiddleware';
import { prisma } from '@/lib/db';
import { userHelper } from '@/lib/helper';

const sendMessage = authMiddleware(async (req, res) => {
	// Id of current user
	const { id: senderId } = req.user;
	// Id of user who message current user
	const { receiverId } = req.query;
	const { content } = req.body;

	const message = await prisma.message.create({
		data: {
			content,
			senderId,
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
	});

	res.status(201).json(message);
});

const getMessages = authMiddleware(async (req, res) => {
	// Id of current user
	const { id: receiverId } = req.user;
	// Id of user who message current user
	const { senderId } = req.query;
	// Fetch all messages where the receiverId and senderId match
	const messages = await prisma.message.findMany({
		where: {
			OR: [
				{
					AND: [{ senderId: senderId }, { receiverId: receiverId }],
				},
				{
					AND: [{ receiverId: senderId }, { senderId: receiverId }],
				},
			],
		},
		include: {
			sender: {
				select: userHelper,
			},
			receiver: {
				select: userHelper,
			},
		},
		orderBy: { createdAt: 'asc' },
	});
	res.status(200).json(messages);
});

const handler = asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'POST':
			await sendMessage(req, res);
			break;
		case 'GET':
			await getMessages(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});

export default handler;
