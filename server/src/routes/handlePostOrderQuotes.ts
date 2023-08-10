import { withAsyncErrorHandling } from './middleware/withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { z } from 'zod-http-schemas';
import {
  bookCarrier,
  BookCarrierResult,
} from '../domain/operations/bookCarrier';
import { validationHandler } from './middleware/validation';
import { createOrderQuote } from '../domain/operations/createOrderQuote';

const schema = {
  body: z.object({ carriers: z.array(carrierCodeSchema).nonempty() }),
  params: z.object({ id: z.string().nonempty() }),
  query: z.any(),
};

const outcomeStatusCodeMap: Record<BookCarrierResult['outcome'], number> = {
  SUCCESS: 200,
  ORDER_ALREADY_BOOKED: 200,
  ORDER_NOT_FOUND: 404,
  NO_MATCHING_QUOTE: 400,
  INVALID_ORDER_STATUS: 400,
};

const handler = validationHandler(schema, async (values, _, res) => {
  const { params, body } = values;
  const createOrderQuoteResult = await createOrderQuote(
    params.id,
    body.carriers
  );
  console.log(values, createOrderQuoteResult);

  res
    .status(outcomeStatusCodeMap[createOrderQuoteResult.outcome])
    .json(createOrderQuoteResult);
});

export const handlePostOrderQuotes = withAsyncErrorHandling(handler);
