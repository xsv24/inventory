import axios from 'axios';
import { expect } from 'chai';
import {
  calculateCarrierFees,
  generateQuote,
  loadFixture,
  SalesOrder,
  unwrap,
} from './util';

const apiClient = axios.create({
  baseURL: 'http://localhost:8044/',
  validateStatus: function (status) {
    return status < 500; // Resolve only if the status code is less than 500
  },
});

const ORDERS = loadFixture<{ salesOrders: SalesOrder[] }>(
  'sales-orders.json'
).salesOrders;

describe('A mini SKUTOPIA API', () => {
  it('should successfully receive an order', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.post('/orders', order);
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      outcome: 'SUCCESS',
      order: {
        ...order,
        quotes: [],
        status: 'RECEIVED',
      },
    });
  });

  it('should list all orders', async () => {
    const result = await apiClient.get('/orders');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [{ ...ORDERS[0], status: 'RECEIVED', quotes: [] }],
    });
  });

  it('receives more orders', async () => {
    const result1 = apiClient.post('/orders', unwrap(ORDERS[1]));
    const result2 = apiClient.post('/orders', unwrap(ORDERS[2]));
    expect((await result1).status).to.eq(200);
    expect((await result2).status).to.eq(200);
  });

  it('should generate a quote for a RECEIVED order', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${order.id}/quotes`, {
      carriers: ['UPS', 'USPS', 'FEDEX'],
    });
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      outcome: 'SUCCESS',
      order: {
        ...order,
        status: 'QUOTED',
        quotes: [
          generateQuote(order, 'UPS'),
          generateQuote(order, 'USPS'),
          generateQuote(order, 'FEDEX'),
        ],
      },
    });
  });

  it('should return 404 for a non-existent order', async () => {
    const result = await apiClient.post(`/orders/123456/quotes`, {
      carriers: ['UPS', 'FEDEX', 'USPS'],
    });
    expect(result.status).to.eq(404);
    expect(result.data).to.deep.eq({
      outcome: 'ORDER_NOT_FOUND',
    });
  });

  it('should successfully book an order', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${order.id}/bookings`, {
      carrier: 'UPS',
    });
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      outcome: 'SUCCESS',
      order: {
        ...order,
        status: 'BOOKED',
        quotes: [
          generateQuote(order, 'UPS'),
          generateQuote(order, 'USPS'),
          generateQuote(order, 'FEDEX'),
        ],
        carrierPricePaid: calculateCarrierFees('UPS', order.items),
        carrierBooked: 'UPS',
      },
    });
  });

  it('should return NO MATCHING QUOTE when attempting to book an order without a matching quote', async () => {
    const order = unwrap(ORDERS[1]);
    await apiClient.post(`/orders/${order.id}/quotes`, {
      carriers: ['USPS', 'FEDEX'],
    });
    const result = await apiClient.post(`/orders/${order.id}/bookings`, {
      carrier: 'UPS',
    });
    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      outcome: 'NO_MATCHING_QUOTE',
      quotes: [
        generateQuote(order, 'USPS'),
        generateQuote(order, 'FEDEX'),
      ],
    });
  });

  it('should return ORDER ALREADY BOOKED when requesting a quote for a BOOKED order', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${order.id}/quotes`, {
      carriers: ['UPS', 'FEDEX', 'USPS'],
    });
    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      outcome: 'ORDER_ALREADY_BOOKED',
    });
  });

  it('should list more orders', async () => {
    const order = unwrap(ORDERS[0]);
    const order1 = unwrap(ORDERS[1]);
    const result = await apiClient.get('/orders');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [
        {
          ...order,
          status: 'BOOKED',
          carrierPricePaid: calculateCarrierFees('UPS', order.items),
          carrierBooked: 'UPS',
          quotes: [
            generateQuote(order, 'UPS'),
            generateQuote(order, 'USPS'),
            generateQuote(order, 'FEDEX'),
          ],
        },
        {
          ...order1,
          status: 'QUOTED',
          quotes: [
            generateQuote(order1, 'USPS'),
            generateQuote(order1, 'FEDEX'),
          ],
        },
        { ...unwrap(ORDERS[2]), status: 'RECEIVED', quotes: [] },
      ],
    });
  });

  it('should list the BOOKED orders', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.get('/orders?status=BOOKED');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [
        {
          ...order,
          status: 'BOOKED',
          carrierPricePaid: calculateCarrierFees('UPS', order.items),
          carrierBooked: 'UPS',
          quotes: [
            generateQuote(order, 'UPS'),
            generateQuote(order, 'USPS'),
            generateQuote(order, 'FEDEX'),
          ],
        },
      ],
    });
  });
});
