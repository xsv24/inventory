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
  // TODO: Refactor this so it's not using the repo directly
  const orders = await ordersRepo.filter(
    values.query.status
      ? (order) => order.status === values.query.status
      : undefined
  );
  res.json({ orders });
});

export const handleGetOrders = withAsyncErrorHandling(handler);
