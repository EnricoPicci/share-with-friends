/* tslint:disable:no-unused-variable */

import { SharableThing } from './sharable-thing';
import { MonetaryAmount } from './monetary-amount';

describe('SharableThing', () => {

// SharableThing tests
    const key = 'key';
    const name = 'a thing';
    const description = 'a thing to share';
    const images = [];
    const ownerEmail = 'owner email';
    const friendEmails = ['f1 email', 'f2 email'];
    const monetaryAmountAmount = 80;

  const monetaryAmount1 = new MonetaryAmount(monetaryAmountAmount);
  it('test creation of a SharableThing with charge in EUR', () => {
    const sharableThing1 = new SharableThing(key, 'a thing', 'a thing to share', [],
                                              ownerEmail, friendEmails, false, 80);
    // expect(sharableThing1.$key).toBe(key);
    expect(sharableThing1.$key).toBe(key);
    expect(sharableThing1.name).toBe(name);
    expect(sharableThing1.description).toBe(description);
    expect(sharableThing1.images).toEqual(images);
    expect(sharableThing1.ownerEmail).toEqual(ownerEmail);
    expect(sharableThing1.friendEmails).toEqual(friendEmails);
    expect(sharableThing1.monetaryAmount).toEqual(monetaryAmount1);
  });

  const monetaryAmountCurrency = 'USD';
  const monetaryAmount2 = new MonetaryAmount(monetaryAmountAmount, monetaryAmountCurrency);
  it('test creation of a SharableThing with charge in USD', () => {
    const sharableThing2 = new SharableThing(key, 'a thing', 'a thing to share', [],
                                            ownerEmail, friendEmails, false, 80, monetaryAmountCurrency);
    // expect(sharableThing2.$key).toBe(key);
    expect(sharableThing2.name).toBe(name);
    expect(sharableThing2.description).toBe(description);
    expect(sharableThing2.images).toEqual(images);
    expect(sharableThing2.ownerEmail).toEqual(ownerEmail);
    expect(sharableThing2.friendEmails).toEqual(friendEmails);
    expect(sharableThing2.monetaryAmount).toEqual(monetaryAmount2);
  });

  it('test that images are never undefined', () => {
    const sharableThing3 = new SharableThing(null);
    expect(sharableThing3.images).toEqual([]);
  });

});
