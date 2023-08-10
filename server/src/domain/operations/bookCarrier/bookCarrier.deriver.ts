import { CarrierCode, CarrierQuote, Order } from '../../entities';

type Success = {
  outcome: 'SUCCESS';
  order: Order;
};
type NoMatchingQuote = {
  outcome: 'NO_MATCHING_QUOTE';
  quotes: Order['quotes'];
};
type InvalidOrderStatus = {
  outcome: 'INVALID_ORDER_STATUS';
  expected: 'QUOTED';
  actual: Order['status'];
};
type OrderNotFound = {
  outcome: 'ORDER_NOT_FOUND';
};
type OrderAlreadyBooked = {
  outcome: 'ORDER_ALREADY_BOOKED';
  order: Order;
};

export type BookCarrierResult =
  | Success
  | NoMatchingQuote
  | InvalidOrderStatus
  | OrderNotFound
  | OrderAlreadyBooked;

export const deriveBookCarrierOutcome = (
  order: Order | undefined,
  carrier: CarrierCode
): BookCarrierResult => {
  switch (order?.status) {
    case undefined:
      return deriveNotFoundState();
    case 'BOOKED':
      return deriveAlreadyBookedState(order);
    case 'CANCELLED':
      return deriveInvalidOrderStatus(order.status);
    // TODO: NOT sure if this is right? Think the tests are wrong here, think we should only allow 'QUOTED'
    // But this is just a guess on my part don't have the full context
    case 'RECEIVED':
    case 'QUOTED':
      return deriveBookedState(order, carrier);
  }
};

const deriveBookedState = (
  order: Order,
  carrier: CarrierCode
): BookCarrierResult => {
  const quote = order.quotes.find((q) => q.carrier === carrier);

  if (!quote) {
    return deriveNoMatchingQuoteState(order.quotes);
  }

  return {
    outcome: 'SUCCESS',
    order: {
      ...order,
      status: 'BOOKED',
      carrierPricePaid: quote.priceCents,
      carrierBooked: quote.carrier,
    },
  };
};

const deriveNotFoundState = (): BookCarrierResult => ({
  outcome: 'ORDER_NOT_FOUND',
});

const deriveAlreadyBookedState = (order: Order): BookCarrierResult => ({
  outcome: 'ORDER_ALREADY_BOOKED',
  order,
});

const deriveNoMatchingQuoteState = (
  quotes: CarrierQuote[]
): BookCarrierResult => ({
  outcome: 'NO_MATCHING_QUOTE',
  quotes: quotes,
});

const deriveInvalidOrderStatus = (
  status: Order['status']
): BookCarrierResult => ({
  outcome: 'INVALID_ORDER_STATUS',
  expected: 'QUOTED',
  actual: status,
});
