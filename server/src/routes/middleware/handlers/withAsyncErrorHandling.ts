import { NextFunction, Request, RequestHandler, Response } from 'express';
import { logger } from '@skutopia/logger';

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const withAsyncErrorHandling =
  (handler: AsyncHandler): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      logger.error('An unexpected error occurred', e);
      res.sendStatus(500);
    }
  };
