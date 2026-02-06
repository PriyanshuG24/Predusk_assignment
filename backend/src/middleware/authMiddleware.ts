import User from '../modules/users/user.model.js';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { UnauthorizedError } from '../lib/error.js';
import { env } from '../config/env.js';
import { JwtPayload } from 'jsonwebtoken';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new UnauthorizedError('Not authorized, no token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(payload._id).select('_id name email');

      if (!user) {
        throw new UnauthorizedError('Not authorized, user not found');
      }
      req.user = {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      };

      next();
    } catch {
      throw new UnauthorizedError('Not authorized, invalid token');
    }
  },
);
