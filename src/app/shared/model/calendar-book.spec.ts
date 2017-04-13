/* tslint:disable:no-unused-variable */
import {parse} from 'date-fns';

import {CalendarBook} from './calendar-book';
import {Booking} from './booking';
import { MonetaryAmount } from './monetary-amount';

describe('CalendarBook', () => {

// CalendarBook tests

// test isDateFree() with blocked dates
  it('test that a date is free', () => {
    const calendarBook = new CalendarBook();
    const date = new Date(2016, 3, 14);
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('test that a date interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    expect(calendarBook.isDateIntervalFree(start, end)).toBeTruthy();
  });
  it('block some dates and test that if a date is free or not', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 13);
    expect(calendarBook.isDateFree(date1)).toBeTruthy();
    const date2 = new Date(2016, 3, 14);
    expect(calendarBook.isDateFree(date2)).toBeFalsy();
    const date3 = new Date(2016, 3, 15);
    expect(calendarBook.isDateFree(date3)).toBeFalsy();
    const date4 = new Date(2016, 3, 16);
    expect(calendarBook.isDateFree(date4)).toBeFalsy();
    const date5 = new Date(2016, 3, 17);
    expect(calendarBook.isDateFree(date5)).toBeTruthy();
  });

  // test isDateIntervalFree() with blocked dates
  it('block a date interval and test that a previous date interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 13);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });
  it('block a date interval and test that a following date interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 18);
    const date2 = new Date(2016, 3, 23);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });

  it('block a date interval and test that the same interval is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(start, end)).toBeFalsy();
  });
  it('block a date interval and test that a date interval overlapping on the first date is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date = new Date(2016, 3, 12);
    expect(calendarBook.isDateIntervalFree(date, start)).toBeFalsy();
  });
  it('block a date interval and test that a date interval overlapping on the last date is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(end, date)).toBeFalsy();
  });
  it('block a date interval and test that a date interval overlapping on some days at the beginning is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 15);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });
  it('block a date interval and test that a date interval overlapping on some days at the end is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 15);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });
  it('block a date interval and test that a date interval overlapping all days is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });

  it('block a date interval and test that a date interval completely within it is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 26);
    calendarBook.blockDateInterval(start, end);
    const date1 = new Date(2016, 3, 16);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });

  it('block 2 date intervals and test that a third date interval within them is free', () => {
    const calendarBook = new CalendarBook();
    const start1 = new Date(2016, 3, 14);
    const end1 = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start1, end1);
    const start2 = new Date(2016, 3, 24);
    const end2 = new Date(2016, 3, 26);
    calendarBook.blockDateInterval(start2, end2);
    const date1 = new Date(2016, 3, 18);
    const date2 = new Date(2016, 3, 20);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });

// test blockweekends
  it('block weekends and test that a Monday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 10); // it is a Monday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block weekends and test that a Tuesday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 11); // it is a Tuesday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block weekends and test that a Wednesday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 12); // it is a Wednesday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block weekends and test that a Thursday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 13); // it is a Thursday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block weekends and test that a Friday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 14); // it is a Friday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block weekends and test that a Sunday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 15); // it is a Saturday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block weekends and test that a Saturday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date = new Date(2017, 3, 16); // it is a Sunday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });

  it('block weekends and test that a date interval containing a Saturday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const date1 = new Date(2017, 3, 14);
    const aSaturday = new Date(2017, 3, 15); // it is a Saturday
    expect(calendarBook.isDateIntervalFree(date1, aSaturday)).toBeFalsy();
  });
  it('block weekends and test that a date interval containing a Sunday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const aSunday = new Date(2017, 3, 16); // it is a Sunday
    const date1 = new Date(2017, 3, 18);
    expect(calendarBook.isDateIntervalFree(aSunday, date1)).toBeFalsy();
  });
  it('block weekends and test that a date interval containing a weekend is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const aFriday = new Date(2017, 3, 7);
    const aMonday = new Date(2017, 3, 10);
    expect(calendarBook.isDateIntervalFree(aFriday, aMonday)).toBeFalsy();
  });
  it('block weekends and test that a date interval not containing a weekend is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWeekends = true;
    const aMonday = new Date(2017, 3, 10);
    const aFriday = new Date(2017, 3, 14);
    expect(calendarBook.isDateIntervalFree(aMonday, aFriday)).toBeTruthy();
  });

// test blockworkweek
  it('block workweek and test that a Monday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 10); // it is a Monday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block workweek and test that a Tuesday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 11); // it is a Tuesday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block workweek and test that a Wednesday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 12); // it is a Wednesday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block workweek and test that a Thursday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 13); // it is a Thursday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block workweek and test that a Friday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 14); // it is a Friday
    expect(calendarBook.isDateFree(date)).toBeFalsy();
  });
  it('block workweek and test that a Sunday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 15); // it is a Saturday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('block workweek and test that a Saturday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const date = new Date(2017, 3, 16); // it is a Sunday
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });

  it('block workweek and test that a date interval between Saturday and Saturday is free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const aSaturday = new Date(2017, 3, 15);
    const aSunday = new Date(2017, 3, 16);
    expect(calendarBook.isDateIntervalFree(aSaturday, aSunday)).toBeTruthy();
  });
  it('block workweek and test that a date interval with a Friday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const aFriday = new Date(2017, 3, 14);
    const aSunday = new Date(2017, 3, 16);
    expect(calendarBook.isDateIntervalFree(aFriday, aSunday)).toBeFalsy();
  });
  it('block workweek and test that a date interval with a Monday is NOT free', () => {
    const calendarBook = new CalendarBook();
    calendarBook.blockWorkweek = true;
    const aSaturday = new Date(2017, 3, 15);
    const aMonday = new Date(2017, 3, 17);
    expect(calendarBook.isDateIntervalFree(aSaturday, aMonday)).toBeFalsy();
  });

  // test removeBlockedIntervals
  it('block a date interval then remove the block and test that the same interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    calendarBook.blockDateInterval(start, end);
    const dateInterval = calendarBook.getDateIntervalsBlocked()[0];
    calendarBook.removeDateIntervalBlock(dateInterval);
    expect(calendarBook.isDateIntervalFree(start, end)).toBeTruthy();
  });
  it('tries to remove a block which has never been added', () => {
    const calendarBook = new CalendarBook();
    const from = new Date(2016, 3, 14);
    const to = new Date(2016, 3, 16);
    expect(() => calendarBook.removeDateIntervalBlock({from, to})).toThrow();
  });


  // test isDateFree with bookings
  const createBooking = (from: Date, to: Date) =>  {
    const key = 'the key';
    const sharableThingKey = 'sharabel thing key';
    const userBookingEmail = 'booker@b.com';
    const monetaryAmountAmount = 90;
    const monetaryAmount1 = new MonetaryAmount(monetaryAmountAmount);
    return new Booking(key , from, to, sharableThingKey, userBookingEmail, false, monetaryAmountAmount);
  };
  it('add a booking and test tha a date before the booking is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date = new Date(2016, 3, 13);
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });
  it('add a booking and test that the first date of the booking is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    expect(calendarBook.isDateFree(start)).toBeFalsy();
  });
  it('add a booking and test that the last date of the booking is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    expect(calendarBook.isDateFree(end)).toBeFalsy();
  });
  it('add a booking and test that one date within start and end of the booking is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date = new Date(2016, 3, 15);
    expect(calendarBook.isDateFree(start)).toBeFalsy();
  });
  it('add a booking and test tha a date after the booking is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date = new Date(2016, 3, 19);
    expect(calendarBook.isDateFree(date)).toBeTruthy();
  });

// test isDateIntervalFree with bookings
  it('add a booking and test that a previous date interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 13);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });
  it('add a booking and test that a following date interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 17);
    const date2 = new Date(2016, 3, 20);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });
  it('add a booking and test that the same date interval is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    expect(calendarBook.isDateIntervalFree(start, end)).toBeFalsy();
  });
  it('add a booking and test that a date interval overlapping on the first date is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date = new Date(2016, 3, 12);
    expect(calendarBook.isDateIntervalFree(date, start)).toBeFalsy();
  });
  it('add a booking and test that a date interval overlapping on the last date is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(end, date)).toBeFalsy();
  });
  it('add a booking and test that a date interval overlapping on some days at the start is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 15);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });
  it('add a booking and test that a date interval overlapping on some days at the end is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 15);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });
  it('add a booking and test that a date interval overlapping on some days at the end is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 12);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });
  it('add a booking and test that a date interval completely within it is NOT free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 26);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    const date1 = new Date(2016, 3, 16);
    const date2 = new Date(2016, 3, 18);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeFalsy();
  });

  it('add 2 bookings and test that a date interval within them is free', () => {
    const calendarBook = new CalendarBook();
    const start1 = new Date(2016, 3, 14);
    const end1 = new Date(2016, 3, 16);
    const oneBooking1 = createBooking(start1, end1);
    calendarBook.addBooking(oneBooking1);
    const start2 = new Date(2016, 3, 24);
    const end2 = new Date(2016, 3, 26);
    const oneBooking2 = createBooking(start2, end2);
    calendarBook.addBooking(oneBooking2);
    const date1 = new Date(2016, 3, 18);
    const date2 = new Date(2016, 3, 20);
    expect(calendarBook.isDateIntervalFree(date1, date2)).toBeTruthy();
  });

  // test removeBooking
  it('add a booking and then remove it and test that the same interval is free', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    calendarBook.addBooking(oneBooking);
    calendarBook.removeBooking(oneBooking);
    expect(calendarBook.isDateIntervalFree(start, end)).toBeTruthy();
  });
  it('tries to remove a booking which has never been added', () => {
    const calendarBook = new CalendarBook();
    const start = new Date(2016, 3, 14);
    const end = new Date(2016, 3, 16);
    const oneBooking = createBooking(start, end);
    expect(() => calendarBook.removeBooking(oneBooking)).toThrow();
  });


});
