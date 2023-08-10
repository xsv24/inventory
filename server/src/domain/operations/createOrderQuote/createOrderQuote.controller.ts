import { ordersRepo } from '../../../repos/ordersRepo';
import { CarrierCode, Order } from '../../entities';
import {
  CreateOrderQuoteResult,
  deriveOrderQuoteResult,
} from './createOrderQuote.deriver';

export const createOrderQuote = async (
  orderId: Order['id'],
  carriers: CarrierCode[]
): Promise<CreateOrderQuoteResult> => {
  const order = await ordersRepo.getOrder(orderId);
  const result = deriveOrderQuoteResult(order, carriers);

  if (result.outcome === 'SUCCESS') {
    await ordersRepo.updateOrder({ ...result.order });
  }

  return result;
};

export { CreateOrderQuoteResult };
