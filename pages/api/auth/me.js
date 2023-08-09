import asyncHandler from '@/middlewares/asyncHandler';
import { getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';
import { userHelper } from '@/lib/helper';

//  @desc   Get current login user
//  @route  GET /api/auth/me
//  @access Private
const currentUser = async (req, res) => {
	const authToken = getCookie('auth-token', { req, res });

	const { userId } = jwt.verify(authToken, 'your-secret-key');

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		include: {
			ledTeam: {
				include: {
					workers: {
						include: {
							worker: {
								select: userHelper,
							},
						},
					},
				},
			},
			contractor: {
				include: {
					servicesOffered: {
						select: {
							service: true,
						},
					},
				},
			},
		},
	});

	res.status(200).json(user);
};

export default asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'GET':
			await currentUser(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});
