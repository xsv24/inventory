import { withAsyncErrorHandling } from './middleware/withAsyncErrorHandling';
import { carrierCodeSchema } from '../domain/entities';
import { z } from 'zod';
import {
  bookCarrier,
  BookCarrierResult,
} from '../domain/operations/bookCarrier';
import { validationHandler } from './middleware/validation';

const schema = {
  body: z.object({ carrier: carrierCodeSchema }),
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
  const bookedCarrierResult = await bookCarrier(params.id, body.carrier);

  res
    .status(outcomeStatusCodeMap[bookedCarrierResult.outcome])
    .json(bookedCarrierResult);
});

export const handlePostOrderBookings = withAsyncErrorHandling(handler);
