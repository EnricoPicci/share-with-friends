/* tslint:disable:no-unused-variable */
import {parse} from 'date-fns';

import {Booking, BookingStatus} from './booking';
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
    const booking = new Booking(key, from, to, sharableThingKey, userBookingEmail, BookingStatus.Confirmed, monetaryAmountAmount);
    expect(booking.$key).toEqual(key);
    expect(booking.from).toEqual(from);
    expect(booking.to).toEqual(to);
    expect(booking.sharableThingKey).toEqual(sharableThingKey);
    expect(booking.userBookingEmail).toEqual(userBookingEmail);
    expect(booking.monetaryAmount).toEqual(monetaryAmount1);
  });

  it('test booking status', () => {
    const from = new Date(2016, 3, 14);
    const to = new Date(2016, 3, 16);
    const booking = new Booking(key, from, to, sharableThingKey, userBookingEmail, BookingStatus.Pending, monetaryAmountAmount);
    expect(booking.status).toEqual(BookingStatus.Pending);
    booking.status = BookingStatus.Confirmed;
    expect(booking.status).toEqual(BookingStatus.Confirmed);
    booking.status = BookingStatus.Removed;
    expect(booking.status).toEqual(BookingStatus.Removed);
  });

});
