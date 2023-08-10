import { RequestHandler } from 'express';
import { logger } from '@skutopia/logger';
import { withAsyncErrorHandling } from '../middleware/withAsyncErrorHandling';
import { ordersRepo } from '../../repos/ordersRepo';
import config from '../../config';

export const handleGetHealthz: RequestHandler = withAsyncErrorHandling(
  async (req, res) => {
    try {
      // const queryResult = await pool.query(`SELECT 1`);
      const queryResult = await ordersRepo.getOrders();
      if (queryResult) {
        res.status(200).json({
          buildNumber: config.BUILD_NUMBER,
          commitHash: config.COMMIT_HASH,
        });
        return;
      }
    } catch (e) {
      logger.error('Health check failed', e);
    }
    res.sendStatus(500);
  }
);
