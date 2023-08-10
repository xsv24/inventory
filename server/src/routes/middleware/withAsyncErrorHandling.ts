import { NextFunction, Request, RequestHandler, Response } from 'express';
import { logger } from '@skutopia/logger';

export const withAsyncErrorHandling =
  (
    handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      logger.error(e);
      res.sendStatus(500);
    }
  };
