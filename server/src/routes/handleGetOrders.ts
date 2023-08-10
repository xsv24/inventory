import { withAsyncErrorHandling } from './middleware/withAsyncErrorHandling';
import { orderStatus } from '../domain/entities';
import { z } from 'zod-http-schemas';
import { validationHandler } from './middleware/validation';
import { getOrders } from '../domain/operations/getOrders';

const schema = {
  query: z.object({ status: orderStatus.optional() }),
  params: z.any(),
  body: z.any(),
};

const handler = validationHandler(schema, async (values, _, res) => {
  const orders = await getOrders(values.query.status);
  res.json({ orders });
});

export const handleGetOrders = withAsyncErrorHandling(handler);
