import asyncHandler from '@/middlewares/asyncHandler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { setCookie } from 'cookies-next';
import { prisma } from '@/lib/db';

//  @desc   Login user
//  @route  GET /api/auth/login
//  @access Public
const loginUser = async (req, res) => {
	const { identifier, password } = req.body;

	// Find the user by username or email
	const user = await prisma.user.findFirst({
		where: {
			OR: [{ username: identifier }, { email: identifier }],
		},
	});

	if (!user) {
		res.status(203).json({ message: 'Invalid username or password' });
		return;
	}

	// Compare the provided password with the hashed password
	const passwordMatch = await bcrypt.compare(password, user.password);

	if (!passwordMatch) {
		res.status(203).json({ message: 'Invalid username or password' });
		return;
	}

	const token = jwt.sign({ userId: user.id }, 'your-secret-key', {
		expiresIn: '30d',
	});

	setCookie('auth-token', token, {
		req,
		res,
		maxAge: 60 * 60 * 24 * 30 * 12,
		sameSite: true,
	});

	const existingTeam = await prisma.team.findUnique({
		where: {
			teamLeaderId: user.id,
		},
	});
	if (!existingTeam && user.role === 'client') {
		await prisma.team.create({
			data: {
				teamLeaderId: user.id,
			},
		});
	}

	res.status(200).json({ ok: true });
};

export default asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'POST':
			await loginUser(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});
