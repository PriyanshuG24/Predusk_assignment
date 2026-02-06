interface UserBasicInfo {
  _id: string;
  name: string;
  email: string;
}

declare module 'express' {
  interface Request {
    user?: UserBasicInfo | null;
  }
}

export * from './authMiddleware.js';
