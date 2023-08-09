import asyncHandler from "@/middlewares/asyncHandler";
import encryptPassword from "@/utils/encryptPassword";
import { prisma } from "@/lib/db";
import { userHelper } from "@/lib/helper";

//  @desc   Get single user by id
//  @route  GET /api/users/:id
//  @access Public
const getUserById = async (req, res) => {
  const { id } = req.query;

  const user = await prisma.user.findUnique({
    where: {
      id,
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

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(200).json(user);
};

//  @desc   Update user
//  @route  PUT /api/users/:id
//  @access Private
const updateUserById = async (req, res) => {
  const { id } = req.query;

  const {
    name,
    username,
    password,
    email,
    contactNumber,
    rating,
    laborType,
    location,
    description,
    servicesOffered,
  } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      id,
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

  if (!user) {
    res.status(201).json({ message: "User not found" });
    return;
  }

  let newRating;
  let newRatingCount;

  if (rating) {
    newRating = user.rating + rating;
    newRatingCount = user.ratingCount + 1;
  }

  let updatedUserData = {
    name: name || user.name,
    username: username || user.username,
    email: email || user.email,
    contactNumber: contactNumber || user.contactNumber,
    rating: newRating || user.rating,
    ratingCount: newRatingCount || user.ratingCount,
  };

  if (password) {
    const hashedPassword = await encryptPassword(password);
    updatedUserData = {
      ...updatedUserData,
      password: hashedPassword,
    };
  }

  if (user.role === "laborer" && laborType) {
    updatedUserData = {
      ...updatedUserData,
      laborType,
    };
  }

  if (
    user.role === "contractor" &&
    (description || location || servicesOffered)
  ) {
    const contractor = await prisma.contractor.findUnique({
      where: {
        userId: user.id,
      },
    });

    let updatedContractorData = {
      location: location || contractor.location,
      description: description || contractor.description,
    };

    await prisma.contractor.update({
      where: {
        userId: user.id,
      },
      data: updatedContractorData,
    });

    if (servicesOffered?.length > 0) {
      for (let service of servicesOffered) {
        const existingService = await prisma.serviceOffered.findFirst({
          where: {
            contractorId: contractor.id,
            service,
          },
        });

        if (!existingService) {
          await prisma.serviceOffered.create({
            data: {
              contractorId: contractor.id,
              service,
            },
          });
        }
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id,
    },
    data: updatedUserData,
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

  res.status(200).json(updatedUser);
};

//  @desc   Delete user
//  @route  DELETE /api/users/:id
//  @access Private
const deleteUserById = async (req, res) => {
  const { id } = req.query;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  await prisma.user.delete({
    where: {
      id,
    },
  });

  res.status(200).json({ message: "User deleted successfully" });
};

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      await getUserById(req, res);
      break;
    case "PUT":
      await updateUserById(req, res);
      break;
    case "DELETE":
      await deleteUserById(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
});
