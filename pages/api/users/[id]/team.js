import asyncHandler from '@/middlewares/asyncHandler';
import encryptPassword from '@/utils/encryptPassword';
import authMiddleware from '@/middlewares/authMiddleware';
import { prisma } from '@/lib/db';

//  @desc   Get single user by id
//  @route  GET /api/users/:id
//  @access Public
