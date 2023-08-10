import { ordersRepo } from '../../../repos/ordersRepo';
import { Order } from '../../entities';

export const getOrders = async (status?: Order['status']): Promise<Order[]> => {
  const query = status ? (order: Order) => order.status === status : undefined;

  return await ordersRepo.filter(query);
};
