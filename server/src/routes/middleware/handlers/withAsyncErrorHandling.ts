import { NextFunction, Request, RequestHandler, Response } from 'express';
import { logger } from '@skutopia/logger';

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// We have an synchronous handler type too just so all the types else where don't have to be updated to be async as well.
export type SyncHandler = RequestHandler;

export const withAsyncErrorHandling =
  (handler: SyncHandler | AsyncHandler): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      logger.error('An unexpected error occurred', e);
      res.sendStatus(500);
    }
  };
