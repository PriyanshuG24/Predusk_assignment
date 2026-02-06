import { Router } from 'express';
import { userRouter } from '../modules/users/user.service.js';

export const apiRouter = Router();

apiRouter.use('/user', userRouter);
