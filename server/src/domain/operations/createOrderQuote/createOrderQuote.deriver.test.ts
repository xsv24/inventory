import { expect } from 'chai';
import { CarrierQuote, Order, OrderInput } from '../../entities';
import {
  CreateOrderQuoteResult,
  deriveOrderQuoteResult,
} from './createOrderQuote.deriver';

const mockOrderInput: OrderInput = {
  id: '123',
  customer: 'Sally Bob',
  items: [
    {
      sku: 'SHOE-RED-1',
      quantity: 1,
      gramsPerItem: 100,
      price: 20,
    },
  ],
};

const mockOrder: Order = {
  ...mockOrderInput,
  quotes: [],
  status: 'RECEIVED',
};

describe('createOrderQuote.deriver', () => {
  describe('order with an invalid status', () => {
    it('returns ORDER_NOT_FOUND when an undefined order is provided', () => {
      const result = deriveOrderQuoteResult(undefined, [
        'UPS',
        'FEDEX',
        'USPS',
      ]);
      expect(result).to.deep.eq({ outcome: 'ORDER_NOT_FOUND' });
    });

    it('returns INVALID_ORDER_STATUS if order is not RECEIVED', () => {
      const order: Order = { ...mockOrder, status: 'CANCELLED' };
      const actual = deriveOrderQuoteResult(order, ['UPS', 'FEDEX', 'USPS']);

      const expected: CreateOrderQuoteResult = {
        outcome: 'INVALID_ORDER_STATUS',
        expected: 'RECEIVED',
        actual: order.status,
      };

      expect(actual).to.deep.eq(expected);
    });

    it('returns CARRIER_ALREADY_QUOTED if order is QUOTED from the same carrier', () => {
      const quote: CarrierQuote = { carrier: 'UPS', priceCents: 805 };
      const order: Order = {
        ...mockOrder,
        status: 'QUOTED',
        quotes: [quote],
      };

      const result = deriveOrderQuoteResult(order, ['UPS', 'FEDEX', 'USPS']);

      const expected: CreateOrderQuoteResult = {
        outcome: 'CARRIER_ALREADY_QUOTED',
        order,
        quote,
      };
      expect(result).to.deep.eq(expected);
    });
  });

  describe('order with an expected status', () => {
    it('returns SUCCESS if order is not RECEIVED', () => {
      const order: Order = { ...mockOrder, status: 'RECEIVED' };
      const actual = deriveOrderQuoteResult(order, ['UPS', 'FEDEX', 'USPS']);

      const expected: CreateOrderQuoteResult = {
        outcome: 'SUCCESS',
        order: {
          id: '123',
          customer: 'Sally Bob',
          items: [
            { sku: 'SHOE-RED-1', quantity: 1, gramsPerItem: 100, price: 20 },
          ],
          quotes: [
            { carrier: 'UPS', priceCents: 805 },
            { carrier: 'FEDEX', priceCents: 1003 },
            { carrier: 'USPS', priceCents: 1052 },
          ],
          status: 'QUOTED',
        },
      };

      expect(actual).to.deep.eq(expected);
    });

    it('returns SUCCESS if order is QUOTED but with different carriers', () => {
      const quote: CarrierQuote = { carrier: 'UPS', priceCents: 805 };
      const order: Order = {
        ...mockOrder,
        status: 'QUOTED',
        quotes: [quote],
      };

      const result = deriveOrderQuoteResult(order, ['FEDEX', 'USPS']);

      const expected: CreateOrderQuoteResult = {
        outcome: 'SUCCESS',
        order: {
          id: '123',
          customer: 'Sally Bob',
          items: [
            { sku: 'SHOE-RED-1', quantity: 1, gramsPerItem: 100, price: 20 },
          ],
          quotes: [
            { carrier: 'UPS', priceCents: 805 },
            { carrier: 'FEDEX', priceCents: 1003 },
            { carrier: 'USPS', priceCents: 1052 },
          ],
          status: 'QUOTED',
        },
      };
      expect(result).to.deep.eq(expected);
    });
  });
});
