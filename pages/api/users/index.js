import asyncHandler from "@/middlewares/asyncHandler";
import encryptPassword from "@/utils/encryptPassword";
import { prisma } from "@/lib/db";
import authMiddleware from "@/middlewares/authMiddleware";

//  @desc   Get all users
//  @route  GET /api/users
//  @access Private
const getUsers = authMiddleware(async (req, res) => {
  const { role } = req.query;
  const { id } = req.user;

  const users = await prisma.user.findMany({
    where: {
      role: {
        equals: role,
      },
      NOT: {
        OR: [
          {
            id,
          },
          {
            role: "client",
          },
        ],
      },
    },
    include: {
      portfolio: {
        include: { projects: { include: { images: true } } },
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

  res.status(200).json(users);
});

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      await getUsers(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
});
