import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: ['http://localhost:3000'],
      credentials: true,
    }),
  );

  app.use(express.json());

  app.use((req, _res, next) => {
    logger.info(`Method: ${req.method}`);
    logger.info(`URL: ${req.url}`);
    next();
  });

  app.use('/api', apiRouter);
  app.use('/health', (_req, res) => {
    res.status(200).json({ message: 'OK' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
const app = createApp();
export default app;
