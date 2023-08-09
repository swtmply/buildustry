import asyncHandler from "@/middlewares/asyncHandler";
import authMiddleware from "@/middlewares/authMiddleware";
import { prisma } from "@/lib/db";

//  @desc   Get user's notifications by user's id
//  @route  GET /api/users/:id/notification
//  @access Private
const getUserNotification = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      user: true,
    },
  });

  if (!notifications || notifications.length === 0) {
    res.status(200).json({ message: "No notifications found" });
    return;
  }

  res.status(200).json(notifications);
});

//  @desc   Create user's notifications by user's id
//  @route  POST /api/users/:id/notification
//  @access Private
const createUserNotification = async (req, res) => {
  const { title, content, userId } = req.body;
  const notification = await prisma.notification.create({
    data: {
      title,
      content,
      userId,
    },
  });

  res.status(201).json(notification);
};

//  @desc   Update notification isRead to true
//  @route  PUT /api/users/:id/notification
//  @access Private
const updateUserNotification = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const notifications = await prisma.notification.updateMany({
    where: {
      userId,
    },
    data: {
      isRead: true,
    },
  });

  if (!notifications || notifications.length === 0) {
    res.status(200).json({ message: "No notifications found" });
    return;
  }

  res.status(200).json({ message: "Notification updated" });
});

//  @desc   Delete notification by ID
//  @route  PUT /api/users/:id/notification
//  @access Private
const deleteUserNotification = authMiddleware(async (req, res) => {
  const { id: userId } = req.user;
  const { id } = req.query;
  const { id: notifId } = req.body;

  if (userId !== id) {
    res.status(203).json({ message: "Unathorized access" });
    return;
  }

  await prisma.notification.delete({
    where: {
      id: notifId,
    },
  });

  res.status(200).json({ message: "Notification deleted successfully" });
});

export default asyncHandler(async (req, res) => {
  switch (req.method) {
    case "GET":
      await getUserNotification(req, res);
      break;
    case "POST":
      await createUserNotification(req, res);
      break;
    case "PUT":
      await updateUserNotification(req, res);
      break;
    case "DELETE":
      await deleteUserNotification(req, res);
      break;
    default:
      res.status(405).json({ message: "Method not allowed" });
      break;
  }
});
