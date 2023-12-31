import { orderStatus } from '../../domain/entities';
import { z } from 'zod-http-schemas';
import {
  validationHandler,
  withAsyncErrorHandling,
} from '../middleware/handlers';
import { getOrders } from '../../domain/operations/getOrders';

const schema = {
  query: z.object({ status: orderStatus.optional() }),
  params: z.any(),
  body: z.any(),
};

const handler = validationHandler(schema, async (req, res) => {
  const orders = await getOrders(req.query.status);
  res.json({ orders });
});

export const handleGetOrders = withAsyncErrorHandling(handler);
