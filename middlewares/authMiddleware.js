import { PrismaClient } from '@prisma/client';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const authMiddleware = (handler) => async (req, res) => {
	try {
		const authToken = getCookie('auth-token', { req, res });

		const { userId } = jwt.verify(authToken, 'your-secret-key');
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		req.user = user;
		return await handler(req, res);
	} catch (error) {
		// Handle token verification errors or unauthorized access
		res.status(401).json({ error: 'Unauthorized' });
		console.error(error);
	}
};

export default authMiddleware;
