import * as express from 'express';
import * as compression from 'compression';
import helmet from 'helmet';
import {
  configureAccessLoggingMiddleware,
  errorLoggingMiddleware,
  logger,
  loggingContextCreatorMiddleware,
} from '@skutopia/logger';
import config from './config';
import { lifecycle } from './lifecycle/lifecycle';
import { handleGetHealthz } from './routes/probes/healthz';
import { handleGetOrders } from './routes/handleGetOrders';
import { handlePostOrders } from './routes/handlePostOrders';
import { handlePostOrderBookings } from './routes/handlePostOrderBookings';
import { handlePostOrderQuotes } from './routes/handlePostOrderQuotes';

export const startServer = () => {
  const app = express();

  app.use(compression());
  app.use(
    helmet({
      // TODO: Make this more secure
      contentSecurityPolicy: false,
    })
  );
  app.use(express.json());
  app.use(loggingContextCreatorMiddleware);
  app.use(
    configureAccessLoggingMiddleware({
      ignoredRoutes: ['/healthz'],
    })
  );
  app.get('/healthz', handleGetHealthz);

  // routes
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
