import asyncHandler from '@/middlewares/asyncHandler';
import encryptPassword from '@/utils/encryptPassword';
import { prisma } from '@/lib/db';

//  @desc   Register user
//  @route  GET /api/auth/register
//  @access Public
const registerUser = async (req, res) => {
	const {
		name,
		username,
		password,
		email,
		contactNumber,
		role,
		laborType,
		location,
		description,
		servicesOffered,
	} = req.body;

	// Find the user by username or email
	const existingUser = await prisma.user.findFirst({
		where: {
			OR: [{ username }, { email }],
		},
	});

	if (existingUser) {
		res
			.status(404)
			.json({ message: 'User already exists with this credentials' });
	}

	const hashedPassword = await encryptPassword(password);
	if (role === 'client' || !role) {
		const user = await prisma.user.create({
			data: {
				name,
				username,
				role,
				password: hashedPassword,
				email,
				contactNumber,
			},
		});

		if (user) {
			await prisma.team.create({
				data: {
					teamLeaderId: user.id,
				},
			});
		}
	} else if (role === 'laborer') {
		await prisma.user.create({
			data: {
				name,
				username,
				role,
				password: hashedPassword,
				email,
				contactNumber,
				laborType,
			},
		});
	} else if (role === 'contractor') {
		const user = await prisma.user.create({
			data: {
				name,
				username,
				role,
				password: hashedPassword,
				email,
				contactNumber,
			},
		});

		if (user) {
			await prisma.contractor.create({
				data: {
					location,
					description,
					userId: user.id,
				},
			});
		}
	}

	res.status(201).json({ message: 'User successfully created.' });
};

export default asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'POST':
			await registerUser(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});
