import { isNever } from '../../../common/utils';
import { carrierRepo } from '../../../repos/carrierRepo';
import { CarrierCode, CarrierQuote, Order } from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type InvalidOrderStatus = {
  outcome: 'INVALID_ORDER_STATUS';
  expected: 'RECEIVED';
  actual: Order['status'];
};
type OrderNotFound = {
  outcome: 'ORDER_NOT_FOUND';
};
type OrderAlreadyBooked = {
  outcome: 'ORDER_ALREADY_BOOKED';
};
type CarrierAlreadyQuoted = {
  outcome: 'CARRIER_ALREADY_QUOTED';
  quote: CarrierQuote;
  order: Order;
};

export type CreateOrderQuoteResult =
  | Success
  | InvalidOrderStatus
  | OrderNotFound
  | OrderAlreadyBooked
  | CarrierAlreadyQuoted;

export const deriveOrderQuoteResult = (
  order: Order | undefined,
  carriers: CarrierCode[]
): CreateOrderQuoteResult => {
  switch (order?.status) {
    case undefined:
      return deriveNotFoundState();
    case 'QUOTED':
      return deriveQuotedState(order, carriers);
    case 'RECEIVED':
      return deriveReceivedState(order, carriers);
    case 'BOOKED':
      return deriveAlreadyBookedState();
    case 'CANCELLED':
      return deriveInvalidState(order.status);
  }
  throw new isNever(`Unexpected order status '${order?.status}'`)
};

const deriveQuotedState = (
  order: Order,
  carriers: CarrierCode[]
): CreateOrderQuoteResult => {
  /*
  This is an assumption that you might still want to add an additional quotation for a different carrier.
  This would be a product & design decision that would need to made here.
  However since this is a test i've decided to allow this but I'd need more context in real life
  
  Other options to this would be:
    1. Always regenerate -> Carrier prices could have been reduced or increased during this time frame so going to steer clear.
    2. Silently ignore -> Only generate quotes for new carriers and keep any existing quotes the same.
        - This might give clients or users the impression they are getting a new quotation for a particular carrier, which could cause confusion.
    3. ✅ Error -> Error if we've already quoted for the same request carrier, will avoid variations in price and avoid confusion.
*/
  const alreadyQuoted = order.quotes.find((quote) =>
    carriers.includes(quote.carrier)
  );

  if (alreadyQuoted) {
    return {
      outcome: 'CARRIER_ALREADY_QUOTED',
      quote: alreadyQuoted,
      order,
    };
  }

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'QUOTED',
      quotes: [...order.quotes, ...deriveCarrierQuotes(carriers, order.items)],
    },
  };
};

const deriveCarrierQuotes = (
  carriers: CarrierCode[],
  items: Order['items']
): CarrierQuote[] =>
  carriers.map((carrier) => carrierRepo.createQuote(carrier, items));

const deriveReceivedState = (
  order: Order,
  carriers: CarrierCode[]
): CreateOrderQuoteResult => ({
  outcome: 'SUCCESS',
  order: {
    ...order,
    status: 'QUOTED',
    quotes: deriveCarrierQuotes(carriers, order.items),
  },
});

const deriveInvalidState = (
  status: Order['status']
): CreateOrderQuoteResult => ({
  outcome: 'INVALID_ORDER_STATUS',
  expected: 'RECEIVED',
  actual: status,
});

const deriveNotFoundState = (): CreateOrderQuoteResult => ({
  outcome: 'ORDER_NOT_FOUND',
});

const deriveAlreadyBookedState = (): CreateOrderQuoteResult => ({
  outcome: 'ORDER_ALREADY_BOOKED',
});
