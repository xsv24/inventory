import { CarrierCode, Order } from '../../entities';
import { ordersRepo } from '../../../repos/ordersRepo';
import {
  BookCarrierResult,
  deriveBookCarrierOutcome,
} from './bookCarrier.deriver';

export const bookCarrier = async (
  orderId: Order['id'],
  carrier: CarrierCode
): Promise<BookCarrierResult> => {
  const order = await ordersRepo.getById(orderId);

  const result = deriveBookCarrierOutcome(order, carrier);

  if (result.outcome === 'SUCCESS') {
    await ordersRepo.update({ ...result.order });
  }
  return result;
};

export { BookCarrierResult };
