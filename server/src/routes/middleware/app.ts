import { configureAccessLoggingMiddleware, loggingContextCreatorMiddleware } from "@skutopia/logger";
import * as compression from 'compression';
import { Application, json } from "express";
import helmet from "helmet";

export const withMiddleware = (app: Application, accessLogger: { ignoredRoutes: string[] }): Application => {
  app.use(compression());

  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV !== 'development'
    })
  );

  app.use(json());
  app.use(loggingContextCreatorMiddleware);
  app.use(configureAccessLoggingMiddleware(accessLogger)
);
  
  return  app;
}
