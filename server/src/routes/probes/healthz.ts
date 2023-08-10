import { RequestHandler } from 'express';
import { logger } from '@skutopia/logger';
import { withAsyncErrorHandling } from '../middleware/withAsyncErrorHandling';
import { ordersRepo } from '../../repos/ordersRepo';
import config from '../../config';

const response = {
  buildNumber: config.BUILD_NUMBER,
  commitHash: config.COMMIT_HASH,
};

export const handleGetHealthz: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    try {
      // const queryResult = await pool.query(`SELECT 1`);
      const connection = await ordersRepo.connection();

      switch (connection) {
        case 'CONNECTION_OK':
          return res.status(200).json(response);
        case 'CONNECTION_BAD':
          logger.error(
            'Health check failed, due to repository connection error'
          );
          return res.status(500).json(response);
      }
    } catch (e) {
      logger.error('Health check failed', e);
      res.sendStatus(500).json(response);
    }
  }
);
