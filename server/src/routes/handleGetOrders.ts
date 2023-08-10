import { withAsyncErrorHandling } from './middleware/withAsyncErrorHandling';
import { ordersRepo } from '../repos/ordersRepo';
import { orderStatus } from '../domain/entities';
import { z } from 'zod-http-schemas';
import { validationHandler } from './middleware/validation';

const schema = {
  query: z.object({ status: orderStatus.optional() }),
  params: z.any(),
  body: z.any(),
};

const handler = validationHandler(schema, async (values, _, res) => {
  const orders = await ordersRepo.getOrders(values.query.status);
  res.json({ orders });
});

export const handleGetOrders = withAsyncErrorHandling(handler);
