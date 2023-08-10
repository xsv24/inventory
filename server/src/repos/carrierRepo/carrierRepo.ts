import { CarrierCode, CarrierQuote, OrderItem } from '../../domain/entities';
import { CarrierPricing } from '../../domain/entities/carrierPricing';

const CARRIER_PRICING_MAP: Record<CarrierCode, CarrierPricing> = {
  UPS: { minCentPrice: 800, gramsPerItemRate: 0.05 },
  USPS: { minCentPrice: 1050, gramsPerItemRate: 0.02 },
  FEDEX: { minCentPrice: 1000, gramsPerItemRate: 0.03 },
};

const calculatePricingInCents = (
  carrierPricing: CarrierPricing,
  items: OrderItem[]
): number =>
  items.reduce(
    (acc, item) => acc + item.gramsPerItem * carrierPricing.gramsPerItemRate,
    carrierPricing.minCentPrice
  );

const createQuote = (
  carrierCode: CarrierCode,
  items: OrderItem[]
): CarrierQuote => {
  const pricing = CARRIER_PRICING_MAP[carrierCode];
  if (!pricing) {
    throw new Error(`pricing for carrier '${carrierCode}' does not exist`);
  }

  return {
    carrier: carrierCode,
    priceCents: calculatePricingInCents(pricing, items),
  };
};

export const carrierRepo = {
  calculatePricingInCents,
  createQuote,
};
