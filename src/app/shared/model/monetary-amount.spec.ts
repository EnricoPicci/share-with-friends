/* tslint:disable:no-unused-variable */

import { MonetaryAmount } from './monetary-amount';

describe('MonetaryAmount', () => {

// MonetaryAmount tests
  it('test default currency as Euro', () => {
    const montaryAmount = new MonetaryAmount(100);
    expect(montaryAmount.amount).toBe(100);
    expect(montaryAmount.currency).toBe('EUR');
  });

  it('test currency as USD', () => {
    const montaryAmount = new MonetaryAmount(90, 'USD');
    expect(montaryAmount.amount).toBe(90);
    expect(montaryAmount.currency).toBe('USD');
  });

});
