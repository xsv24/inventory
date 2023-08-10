import { carrierCodeSchema } from '../../domain/entities';
import { z } from 'zod-http-schemas';
import {
  validationHandler,
  withAsyncErrorHandling,
} from '../middleware/handlers';
import {
  createOrderQuote,
  CreateOrderQuoteResult,
} from '../../domain/operations/createOrderQuote';

const schema = {
  body: z.object({ carriers: z.array(carrierCodeSchema).nonempty() }),
  params: z.object({ id: z.string().nonempty() }),
  query: z.any(),
};

const outcomeStatusCodeMap: Record<CreateOrderQuoteResult['outcome'], number> =
  {
    SUCCESS: 200,
    ORDER_NOT_FOUND: 404,
    CARRIER_ALREADY_QUOTED: 400,
    ORDER_ALREADY_BOOKED: 400,
    INVALID_ORDER_STATUS: 400,
  };

const handler = validationHandler(schema, async (req, res) => {
  const { params, body } = req;
  const createOrderQuoteResult = await createOrderQuote(
    params.id,
    body.carriers
  );

  res
    .status(outcomeStatusCodeMap[createOrderQuoteResult.outcome])
    .json(createOrderQuoteResult);
});

export const handlePostOrderQuotes = withAsyncErrorHandling(handler);
