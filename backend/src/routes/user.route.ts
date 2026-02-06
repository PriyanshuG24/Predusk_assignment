import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserWork,
  updateUserLinks,
  deleteProjectById,
  addProject,
  updateProject,
} from '../modules/users/user.service.js';
import { basicAuth } from '../middleware/authMiddleware.js';
import { BadRequestError } from '../lib/error.js';
import { env } from '../config/env.js';
import User from '../modules/users/user.model.js';
import { readLimiter, writeLimiter } from '../middleware/rateLimiter.js';
export const userRouter = Router();

userRouter.get(
  '/profile',
  readLimiter,
  basicAuth,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getUserProfile();
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.put(
  '/profile',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await updateUserProfile(req.body);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.post(
  '/work',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description } = req.body;
      const user = await updateUserWork({ title, description });
      res.status(200).json({
        success: true,
        data: {
          work: user?.work,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.put(
  '/links',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('PUT links request:', req.body.links);
      const user = await updateUserLinks(req.body.links);
      res.status(200).json({
        success: true,
        data: {
          links: user?.links,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.delete(
  '/project/delete',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.body;
      const projects = await deleteProjectById(projectId);
      res.status(200).json({
        success: true,
        data: {
          projects,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.post(
  '/project/add',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, skills, links } = req.body;
      if (!title || !description || !skills) {
        throw new BadRequestError('All fields are required');
      }
      const projects = await addProject({ title, description, skills, links });
      res.status(200).json({
        success: true,
        data: {
          projects,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.put(
  '/project/update',
  writeLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, title, description, skills, links } = req.body;
      if (!projectId) {
        throw new BadRequestError('Project ID is required');
      }
      if (!title || !description || !skills) {
        throw new BadRequestError('All fields are required');
      }
      const projects = await updateProject({ projectId, title, description, skills, links });
      res.status(200).json({
        success: true,
        data: {
          projects,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

userRouter.get(
  '/project/search',
  readLimiter,
  basicAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { searchQuery, skills, page = '1', limit = '4' } = req.query;

      const currentPage = parseInt(page as string) || 1;
      const pageSize = parseInt(limit as string) || 4;
      const skip = (currentPage - 1) * pageSize;

      let allProjects;

      if (skills && searchQuery && typeof skills === 'string' && typeof searchQuery === 'string') {
        const skillArray = skills.split(',').map((s) => s.trim().toLowerCase());
        const user = await User.findOne({ email: env.BASIC_AUTH_EMAIL });

        if (!user) {
          throw new BadRequestError('User not found');
        }
        const query = searchQuery.toLowerCase().trim();
        allProjects = user.projects.filter(
          (project) =>
            project.skills.some((skill) => skillArray.includes(skill.toLowerCase())) &&
            (project.title.toLowerCase().includes(query) ||
              project.description.toLowerCase().includes(query)),
        );
      } else if (skills && typeof skills === 'string') {
        const skillArray = skills.split(',').map((s) => s.trim().toLowerCase());
        const user = await User.findOne({ email: env.BASIC_AUTH_EMAIL });

        if (!user) {
          throw new BadRequestError('User not found');
        }
        allProjects = user.projects.filter((project) =>
          project.skills.some((skill) => skillArray.includes(skill.toLowerCase())),
        );
      } else if (searchQuery && typeof searchQuery === 'string') {
        const user = await User.findOne({ email: env.BASIC_AUTH_EMAIL });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        const query = searchQuery.toLowerCase().trim();
        allProjects = user.projects.filter(
          (project) =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query),
        );
      } else {
        const user = await User.findOne({ email: env.BASIC_AUTH_EMAIL });

        if (!user) {
          throw new BadRequestError('User not found');
        }

        allProjects = user.projects;
      }

      const totalProjects = allProjects.length;
      const totalPages = Math.ceil(totalProjects / pageSize);
      const projects = allProjects.slice(skip, skip + pageSize);

      res.status(200).json({
        success: true,
        data: {
          projects,
          pagination: {
            currentPage,
            totalPages,
            totalProjects,
            pageSize,
            hasNextPage: currentPage < totalPages,
            hasPrevPage: currentPage > 1,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);
