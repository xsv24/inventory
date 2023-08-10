import { Order } from '../domain/entities';
import { Connection, Query, Repository } from './repo';

const ORDERS: Record<Order['id'], Order> = {};

const getById = async (id: Order['id']): Promise<Order | undefined> =>
  ORDERS[id];

const filter = async (query?: Query<Order>): Promise<Order[]> => {
  const orders = Object.values(ORDERS);
  return query ? orders.filter(query) : orders;
};

const create = async (order: Order): Promise<Order> => {
  if (ORDERS[order.id]) {
    throw new Error('Order already exists');
  }
  ORDERS[order.id] = order;
  return order;
};

const update = async (
  order: Partial<Order> & { id: Order['id'] }
): Promise<Order> => {
  const currentOrder = ORDERS[order.id];
  if (!currentOrder) {
    throw new Error(`Order matching ${order.id} does not exist`);
  }
  Object.assign(ORDERS[order.id], order);

  return ORDERS[order.id];
};

// TODO: Repository throws errors would be nice to return a result
export const ordersRepo: Repository<Order> = {
  getById,
  create,
  update,
  filter,
  connection: async (): Promise<Connection> => 'CONNECTION_OK',
};
