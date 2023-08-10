import { expect } from 'chai';
import { CarrierCode, OrderItem } from '../../domain/entities';
import { carrierRepo } from './carrierRepo';
import { CarrierPricing } from '../../domain/entities/carrierPricing';

const CARRIER_PRICING_MAP: Record<CarrierCode, CarrierPricing> = {
  UPS: { minCentPrice: 800, gramsPerItemRate: 0.05 },
  USPS: { minCentPrice: 1050, gramsPerItemRate: 0.02 },
  FEDEX: { minCentPrice: 1000, gramsPerItemRate: 0.03 },
};

describe('carrierRepo', () => {
  const items: OrderItem[] = [
    { sku: '1', quantity: NaN, gramsPerItem: 1, price: NaN },
    { sku: '2', quantity: NaN, gramsPerItem: 2, price: NaN },
  ];

  it('should calculate pricing correctly with pricing', () => {
    const pricing = {
      minCentPrice: 800,
      gramsPerItemRate: 0.05,
    };

    const price = carrierRepo.calculatePricingInCents(pricing, items);

    const price1 =
      pricing.minCentPrice + items[0].gramsPerItem * pricing.gramsPerItemRate;
    const price2 = price1 + items[1].gramsPerItem * pricing.gramsPerItemRate;

    expect(price).to.eq(price2);
  });

  it('Should calculate priceCents based off the carrier', () => {
    const { UPS, USPS, FEDEX } = CARRIER_PRICING_MAP;
    const ups = carrierRepo.createQuote('UPS', items);
    const usps = carrierRepo.createQuote('USPS', items);
    const fedex = carrierRepo.createQuote('FEDEX', items);

    const expected = (pricing: CarrierPricing): number =>
      items[0].gramsPerItem * pricing.gramsPerItemRate + pricing.minCentPrice;

    expect(ups.priceCents).to.deep.eq(expected(UPS));
    expect(usps.priceCents).to.eq(expected(USPS));
    expect(fedex.priceCents).to.eq(expected(FEDEX));
  });
});
