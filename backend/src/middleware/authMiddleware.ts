import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../lib/error.js';
import { env } from '../config/env.js';

export function basicAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return next(new UnauthorizedError('Basic auth required'));
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

  const [email, password] = credentials.split(':');
  if (email !== env.BASIC_AUTH_EMAIL || password !== env.BASIC_AUTH_PASS) {
    return next(new UnauthorizedError('Invalid basic auth credentials'));
  }

  next();
}
