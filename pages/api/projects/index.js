import asyncHandler from '@/middlewares/asyncHandler';
import authMiddleware from '@/middlewares/authMiddleware';
import { prisma } from '@/lib/db';
import { userHelper } from '@/lib/helper';

//  @desc   Get all projects
//  @route  GET /api/projects
//  @access Private

const getProjects = authMiddleware(async (req, res) => {
	const { id: userId } = req.user;
	const projects = await prisma.project.findMany({
		where: {
			OR: [
				{
					clientId: userId,
				},
				{
					workerId: userId,
				},
			],
		},
		include: {
			client: {
				select: userHelper,
			},
			worker: {
				select: userHelper,
			},
		},
	});
	res.status(200).json(projects);
});

//  @desc   Create project
//  @route  POST /api/projects
//  @access Private
const createProject = authMiddleware(async (req, res) => {
	const { typeOfService, name, description, workerId, estimationCost } =
		req.body;

	const { id: clientId } = req.user;

	const project = await prisma.project.create({
		data: {
			typeOfService,
			name,
			description,
			clientId,
			workerId,
			estimationCost,
		},
		include: {
			client: {
				select: userHelper,
			},
			worker: {
				select: userHelper,
			},
		},
	});

	res.status(201).json(project);
});

export default asyncHandler(async (req, res) => {
	switch (req.method) {
		case 'GET':
			await getProjects(req, res);
			break;
		case 'POST':
			await createProject(req, res);
			break;
		default:
			res.status(405).json({ message: 'Method not allowed' });
			break;
	}
});
