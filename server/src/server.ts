import * as express from 'express';
import { errorLoggingMiddleware, logger } from '@skutopia/logger';
import config from './config';
import { lifecycle } from './lifecycle/lifecycle';
import { handleGetHealthz } from './routes/probes/healthz';
import {
  handleGetOrders,
  handlePostOrders,
  handlePostOrderBookings,
  handlePostOrderQuotes,
} from './routes/handlers';
import { withMiddleware } from './routes/middleware';

export const startServer = () => {
  const app = withMiddleware(express(), {
    ignoredRoutes: ['/healthz'],
  });

  // routes
  app.get('/healthz', handleGetHealthz);
  app.get('/orders', handleGetOrders);
  app.post('/orders', handlePostOrders);
  app.post('/orders/:id/quotes', handlePostOrderQuotes);
  app.post('/orders/:id/bookings', handlePostOrderBookings);

  app.use(errorLoggingMiddleware);
  const server = app.listen(config.PORT, () => {
    logger.info(`Server started on port ${config.PORT}`);
    lifecycle.on('close', () => {
      if (!server) {
        return;
      }

      server.close();
    });
  });

  return app;
};
