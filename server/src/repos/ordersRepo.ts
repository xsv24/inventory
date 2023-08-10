import { Order } from '../domain/entities';

const ORDERS: Record<Order['id'], Order> = {};

const getOrder = async (id: Order['id']): Promise<Order | undefined> =>
  ORDERS[id];

const getOrders = async (status?: Order['status']): Promise<Order[]> => {
  const orders = Object.values(ORDERS);
  if (status) {
    return orders.filter((order) => order.status === status);
  }
  return orders;
};

const saveOrder = async (order: Order): Promise<void> => {
  if (ORDERS[order.id]) {
    throw new Error('Order already exists');
  }
  ORDERS[order.id] = order;
};

const updateOrder = async (
  order: Partial<Order> & { id: Order['id'] }
): Promise<void> => {
  const currentOrder = ORDERS[order.id];
  if (!currentOrder) {
    throw new Error(`Order matching ${order.id} does not exist`);
  }
  Object.assign(ORDERS[order.id], order);
};

export const ordersRepo = {
  getOrder,
  getOrders,
  saveOrder,
  updateOrder,
};
