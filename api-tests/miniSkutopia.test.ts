import axios from 'axios';
import { expect } from 'chai';
import {
  buildOrder,
  generateQuote,
  loadFixture,
  SalesOrder,
  unwrap,
} from './util';
import config from '../server/src/config';

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
    const uncreated = unwrap(ORDERS[0]);
    const result = await apiClient.post('/orders', uncreated);
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      outcome: 'SUCCESS',
      order: buildOrder({
        order: uncreated,
        status: 'RECEIVED',
        quoted: [],
      }),
    });
  });

  it('should list all orders', async () => {
    const created = unwrap(ORDERS[0]);
    const result = await apiClient.get('/orders');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [
        buildOrder({
          order: created,
          status: 'RECEIVED',
          quoted: [],
        }),
      ],
    });
  });

  it('receives more orders', async () => {
    const result1 = apiClient.post('/orders', unwrap(ORDERS[1]));
    const result2 = apiClient.post('/orders', unwrap(ORDERS[2]));
    expect((await result1).status).to.eq(200);
    expect((await result2).status).to.eq(200);
  });

  it('should generate a quote for a RECEIVED order', async () => {
    const received = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${received.id}/quotes`, {
      carriers: ['UPS', 'USPS', 'FEDEX'],
    });
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      outcome: 'SUCCESS',
      order: buildOrder({
        order: received,
        status: 'QUOTED',
        quoted: ['UPS', 'USPS', 'FEDEX'],
      }),
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
      order: buildOrder({
        order,
        status: 'BOOKED',
        booked: 'UPS',
        quoted: ['UPS', 'USPS', 'FEDEX'],
      }),
    });
  });

  it('should return ORDER ALREADY BOOKED when requesting a booking for a BOOKED order', async () => {
    const order = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${order.id}/bookings`, {
      carrier: 'UPS',
    });
    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      outcome: 'ORDER_ALREADY_BOOKED',
      order: buildOrder({
        order,
        status: 'BOOKED',
        booked: 'UPS',
        quoted: ['UPS', 'USPS', 'FEDEX'],
      }),
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
      quotes: [generateQuote(order, 'USPS'), generateQuote(order, 'FEDEX')],
    });
  });

  it('should return ORDER ALREADY BOOKED when requesting a quote for a BOOKED order', async () => {
    const booked = unwrap(ORDERS[0]);
    const result = await apiClient.post(`/orders/${booked.id}/quotes`, {
      carriers: ['UPS', 'FEDEX', 'USPS'],
    });
    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      outcome: 'ORDER_ALREADY_BOOKED',
      order: buildOrder({
        order: booked,
        status: 'BOOKED',
        booked: 'UPS',
        quoted: ['UPS', 'USPS', 'FEDEX'],
      }),
    });
  });

  it('should return CARRIER ALREADY BOOKED when requesting a quote for a BOOKED order', async () => {
    const quoted = unwrap(ORDERS[1]);
    const result = await apiClient.post(`/orders/${quoted.id}/quotes`, {
      carriers: ['UPS', 'FEDEX', 'USPS'],
    });
    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      outcome: 'CARRIER_ALREADY_QUOTED',
      quote: generateQuote(quoted, 'USPS'),
    });
  });

  it('should list more orders', async () => {
    const booked = unwrap(ORDERS[0]);
    const quoted = unwrap(ORDERS[1]);
    const received = unwrap(ORDERS[2]);

    const result = await apiClient.get('/orders');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [
        buildOrder({
          order: booked,
          status: 'BOOKED',
          booked: 'UPS',
          quoted: ['UPS', 'USPS', 'FEDEX'],
        }),
        buildOrder({
          order: quoted,
          status: 'QUOTED',
          quoted: ['USPS', 'FEDEX'],
        }),
        buildOrder({
          order: received,
          status: 'RECEIVED',
          quoted: [],
        }),
      ],
    });
  });

  it('should list the BOOKED orders', async () => {
    const booked = unwrap(ORDERS[0]);
    const result = await apiClient.get('/orders?status=BOOKED');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      orders: [
        buildOrder({
          order: booked,
          status: 'BOOKED',
          booked: 'UPS',
          quoted: ['UPS', 'USPS', 'FEDEX'],
        }),
      ],
    });
  });

  it('/healthz should return build meta data', async () => {
    const result = await apiClient.get('/healthz');
    expect(result.status).to.eq(200);
    expect(result.data).to.deep.eq({
      buildNumber: config.BUILD_NUMBER,
      commitHash: config.COMMIT_HASH,
    });
  });

  it('Validation checks', async () => {
    const result = await apiClient.get('/orders?status=INVALID_STATUS');

    expect(result.status).to.eq(400);
    expect(result.data).to.deep.eq({
      error: 'INVALID_QUERY_PARAMETER',
      details: [
        {
          code: 'invalid_enum_value',
          message:
            "Invalid enum value. Expected 'RECEIVED' | 'QUOTED' | 'BOOKED' | 'CANCELLED', received 'INVALID_STATUS'",
          options: ['RECEIVED', 'QUOTED', 'BOOKED', 'CANCELLED'],
          path: ['status'],
          received: 'INVALID_STATUS',
        },
      ],
    });
  });
});
