import asyncHandler from "@/middlewares/asyncHandler";
import authMiddleware from "@/middlewares/authMiddleware";
import { prisma } from "@/lib/db";
import { userHelper } from "@/lib/helper";

//  @desc   Get single project
//  @route  GET /api/projects/:id
//  @access Private
const getProjectById = async (req, res) => {
  const { id } = req.query;
  const project = await prisma.project.findUnique({
    where: {
      id,
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

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  res.status(200).json(project);
};

//  @desc   Update project
//  @route  PUT /api/projects/:id
//  @access Private
const updateProjectById = authMiddleware(async (req, res) => {
  const { id } = req.query;

  const {
    typeOfService,
    name,
    description,
    status,
    dateFinished,
    isRated,
    estimationCost,
  } = req.body;

  console.log(req.body);
  const { id: clientId } = req.user;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  // if (project.clientId !== clientId) {
  // 	res.status(203).json({ message: 'Unauthorized access' });
  // 	return;
  // }

  let updatedProjectData = {
    typeOfService: typeOfService || project.typeOfService,
    name: name || project.name,
    description: description || project.description,
    status: status || project.status,
    dateFinished: dateFinished || project.dateFinished,
    isRated: isRated || project.isRated,
    estimationCost: estimationCost || project.estimationCost,
  };

  const team = await prisma.team.findUnique({
    where: {
      teamLeaderId: project.clientId,
    },
  });

  if (!team) {
    res.status(200).json({ message: "Team not found" });
    return;
  }

  if (status === "inProgress") {
    await prisma.worker.create({
      data: {
        teamId: team.id,
        workerId: project.workerId,
      },
    });
  }

  const updatedProject = await prisma.project.update({
    where: {
      id,
    },
    data: updatedProjectData,
    include: {
      client: {
        select: userHelper,
      },
      worker: {
        select: userHelper,
      },
    },
  });

  res.status(200).json(updatedProject);
});

//  @desc   Delete project
//  @route  DELETE /api/projects/:id
//  @access Private
const deleteProjectById = authMiddleware(async (req, res) => {
  const { id } = req.query;
  const { id: clientId } = req.user;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    res.status(404).json({ message: "Project not found" });
    return;
  }

  if (project.clientId !== clientId) {
    res.status(203).json({ message: "Unauthorized access" });
    return;
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  res.status(200).json({ message: "Project deleted successfully" });
});

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      await getProjectById(req, res);
      break;
    case "PUT":
      await updateProjectById(req, res);
      break;
    case "DELETE":
      await deleteProjectById(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
});
