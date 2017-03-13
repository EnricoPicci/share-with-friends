/* tslint:disable:no-unused-variable */
import {parse} from 'date-fns';

import {Booking} from './booking';
import { MonetaryAmount } from './monetary-amount';

describe('Booking', () => {
    const key = 'the key';
    const sharableThingKey = 'sharabel thing key';
    const userBookingEmail = 'booker@b.com';
    const monetaryAmountAmount = 90;
    const monetaryAmount1 = new MonetaryAmount(monetaryAmountAmount);

// Booking tests
  it('test creation of a Booking', () => {
    const from = new Date(2016, 3, 14);
    const to = new Date(2016, 3, 16);
    const booking = new Booking(key, from, to, sharableThingKey, userBookingEmail, false, monetaryAmountAmount);
    expect(booking.$key).toEqual(key);
    expect(booking.from).toEqual(from);
    expect(booking.to).toEqual(to);
    expect(booking.sharableThingKey).toEqual(sharableThingKey);
    expect(booking.userBookingEmail).toEqual(userBookingEmail);
    expect(booking.monetaryAmount).toEqual(monetaryAmount1);
  });

});
