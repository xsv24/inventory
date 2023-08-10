import { z } from 'zod-http-schemas';
import {
  createOrder,
  CreateOrderResult,
} from '../../domain/operations/createOrder';
import { orderInputSchema } from '../../domain/entities';
import {
  validationHandler,
  withAsyncErrorHandling,
} from '../middleware/handlers';

const schema = {
  body: orderInputSchema,
  params: z.any(),
  query: z.any(),
};

const outcomeStatusCodeMap: Record<CreateOrderResult['outcome'], number> = {
  SUCCESS: 200,
  ORDER_ALREADY_EXISTS: 200,
  ORDER_HAS_NO_LINE_ITEMS: 400,
};

const handler = validationHandler(schema, async (values, _, res) => {
  const result = await createOrder(values.body);

  res.status(outcomeStatusCodeMap[result.outcome]).json(result);
});

export const handlePostOrders = withAsyncErrorHandling(handler);
