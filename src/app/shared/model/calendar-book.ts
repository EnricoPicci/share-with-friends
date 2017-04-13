import {isWithinRange, isAfter, isBefore, areRangesOverlapping, isWeekend, eachDay} from 'date-fns';

import {CalendarBookJsonInterface} from './calendar-book-json.interface';
import {CalendarBookDateInterval} from './calendar-book-date-interval';
import {Booking} from './booking';

export class CalendarBook {
    private datesBlocked = new Array<CalendarBookDateInterval>();
    blockWeekends = false;
    blockWorkweek = false;
    bookings = new Array<Booking>();

    constructor(calendarBookJson?: CalendarBookJsonInterface) {

    }

    isDateFree(date: Date) {
        return this.isDateIntervalFree(date, date);
    }
    isDateIntervalFree(from: Date, to: Date) {
        const isIntervalOverlappingDatesBlocked = this.isDateIntervalOverlapping(from, to, this.datesBlocked);
        const bookingsDateIntervals = this.bookings.map(booking => {
            return {from: booking.from, to: booking.to};
        });
        const isIntervalOverlappingBookings = this.isDateIntervalOverlapping(from, to, bookingsDateIntervals);
        let isBlockedForWeekend = false;
        if (this.blockWeekends) {
            const allDays = eachDay(from, to);
            for (const oneDay of allDays) {
                const isOneDayWeekEnd = isWeekend(oneDay);
                isBlockedForWeekend = isOneDayWeekEnd;
                if (isBlockedForWeekend) {
                    break;
                }
            }
        }
        let isBlockedForWorkweek = false;
        if (this.blockWorkweek) {
            const allDays = eachDay(from, to);
            for (const oneDay of allDays) {
                const isOneDayWeekday = !isWeekend(oneDay);
                isBlockedForWorkweek = isOneDayWeekday;
                if (isBlockedForWorkweek) {
                    break;
                }
            }
        }
        return !isIntervalOverlappingDatesBlocked && !isIntervalOverlappingBookings && !isBlockedForWeekend && !isBlockedForWorkweek;
    }
    private isDateIntervalOverlapping(from: Date, to: Date, dateIntervals: Array<CalendarBookDateInterval>) {
        const datesBlockedOverlapping = dateIntervals
            .filter(dateInterval => {
                // return areRangesOverlapping(from, to, dateInterval.from, dateInterval.to);
                return isWithinRange(dateInterval.from, from, to)
                || isWithinRange(dateInterval.to, from, to)
                || (isAfter(from, dateInterval.from) && isBefore(to, dateInterval.to));
            });
        return datesBlockedOverlapping.length !== 0;
    }

    getDateIntervalsBlocked() {
        return this.datesBlocked;
    }
    blockDateInterval(from: Date, to: Date) {
        this.datesBlocked.push({from, to});
    }
    removeDateIntervalBlock(dateInterval: CalendarBookDateInterval) {
        const dateIntervalIndex = this.datesBlocked.indexOf(dateInterval);
        if (dateIntervalIndex === -1) {
            throw Error('Date interval ' + dateInterval + ' not blocked');
        }
        this.datesBlocked.splice(dateIntervalIndex, 1);
    }

    addBooking(booking: Booking) {
        this.bookings.push(booking);
    }
    removeBooking(booking: Booking) {
        const bookingIndex = this.bookings.indexOf(booking);
        if (bookingIndex === -1) {
            throw Error('Booking ' + booking + ' not present');
        }
        this.bookings.splice(bookingIndex, 1);
    }
}
