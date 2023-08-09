import asyncHandler from "@/middlewares/asyncHandler";
import authMiddleware from "@/middlewares/authMiddleware";
import { prisma } from "@/lib/db";

//  @desc   Get single portfolio
//  @route  GET /api/users/:id/portfolio
//  @access Public
const getPortfolioByUserId = async (req, res) => {
  const { id } = req.query;

  const portfolio = await prisma.portfolio.findFirst({
    where: {
      userId: id,
    },
    include: {
      projects: {
        include: {
          images: true,
        },
      },
    },
  });

  if (!portfolio) {
    res.status(200).json({ message: "Portfolio not found" });
    return;
  }

  res.status(200).json(portfolio);
};

//  @desc   Create a portfolio
//  @route  POST /api/users/:id/portfolio
//  @access Private
const createPortfolioByUserId = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.query;

  if (userId !== id) {
    res.status(203).json({ message: "Unathorized access" });
    return;
  }

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      userId,
    },
    include: {
      projects: {
        include: {
          images: true,
        },
      },
    },
  });

  // Check if portfolio is existing
  if (existingPortfolio) {
    res.status(200).json({ message: "Portfolio is already created" });
    return;
  }

  const { rating, projects } = req.body;
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      portfolio: {
        create: {
          userId,
          rating,
          projects: {
            create: projects.map((project) => ({
              name: project.name,
              images: {
                create: project.images.map((url) => ({
                  url,
                })),
              },
            })),
          },
        },
      },
    },
  });

  res.status(200).json({ message: "Portfolio created successfully" });
});

//  @desc   Update a portfolio
//  @route  PUT /api/users/:id/portfolio
//  @access Private
const updatePortfolioByUserId = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.query;
  const { rating, name, images } = req.body;

  if (userId !== id) {
    res.status(203).json({ message: "Unathorized access" });
    return;
  }

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      userId,
    },
    include: {
      projects: {
        include: {
          images: true,
        },
      },
    },
  });

  // Check if portfolio is existing
  if (!existingPortfolio) {
    res.status(200).json({ message: "Project not found" });
    return;
  }

  if (images) {
    await prisma.completedProject.create({
      data: {
        portfolioId: existingPortfolio.id,
        name,
        images: {
          create: images.map((url) => ({
            url,
          })),
        },
      },
    });
  }

  if (rating) {
    await prisma.portfolio.updateMany({
      where: {
        userId,
      },
      data: { rating },
    });
  }

  // Retrieve the updated portfolio with the newly created completed projects
  const updatedPortfolio = await prisma.portfolio.findUnique({
    where: { id: existingPortfolio.id },
    include: {
      projects: {
        include: {
          images: true,
        },
      },
    },
  });

  res.status(200).json(updatedPortfolio);
});

//  @desc   Delete a portfolio
//  @route  DELETE /api/users/:id/portfolio
//  @access Private
const deletePortfolioByUserId = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.query;
  const { completedProjects } = req.body;

  if (userId !== id) {
    res.status(203).json({ message: "Unathorized access" });
    return;
  }

  const existingPortfolio = await prisma.portfolio.findFirst({
    where: {
      userId,
    },
    include: {
      projects: {
        include: {
          images: true,
        },
      },
    },
  });

  // Check if portfolio is existing
  if (!existingPortfolio) {
    res.status(200).json({ message: "Portfolio not found" });
    return;
  }

  // Disable foreign key constraints

  // Delete images associated with completed projects
  for (const project of existingPortfolio.projects) {
    await prisma.image.deleteMany({
      where: { projectId: project.id },
    });
  }

  // Delete the portfolio
  await prisma.completedProject.deleteMany({
    where: { portfolioId: existingPortfolio.id },
  });

  // Delete the portfolio
  await prisma.portfolio.delete({
    where: { id: existingPortfolio.id },
  });

  res.status(200).json({ message: "Portfolio deleted successfully" });
});

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      await getPortfolioByUserId(req, res);
      break;
    case "POST":
      await createPortfolioByUserId(req, res);
      break;
    case "PUT":
      await updatePortfolioByUserId(req, res);
      break;
    case "DELETE":
      await deletePortfolioByUserId(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
});
