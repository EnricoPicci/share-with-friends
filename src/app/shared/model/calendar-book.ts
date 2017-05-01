import {isWithinRange, isAfter, isBefore, areRangesOverlapping, isWeekend, eachDay,
        isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday} from 'date-fns';

import {CalendarBookJsonInterface} from './calendar-book-json.interface';
import {CalendarBookDateInterval} from './calendar-book-date-interval';
import {Booking} from './booking';

export class CalendarBook {
    private datesBlocked: Array<CalendarBookDateInterval>;
    set blockWeekends(block) {
        const _block = block ? block : false;
        this.blockSaturday = _block;
        this.blockSunday = _block;
    };
    get blockWeekends() {
        return this.blockSaturday && this.blockSunday;
    };
    set blockWorkweek(block) {
        const _block = block ? block : false;
        this.blockMonday = _block;
        this.blockTuesday = _block;
        this.blockWednesday = _block;
        this.blockThursday = _block;
        this.blockFriday = _block;
    };
    get blockWorkweek() {
        return this.blockMonday &&
                this.blockTuesday &&
                this.blockWednesday &&
                this.blockThursday &&
                this.blockFriday;
    };
    blockMonday = false;
    blockTuesday = false;
    blockWednesday = false;
    blockThursday = false;
    blockFriday = false;
    blockSaturday = false;
    blockSunday = false;

    bookings = new Array<Booking>();

    constructor(calendarBookJson?: CalendarBookJsonInterface) {
        this.blockMonday = calendarBookJson ? calendarBookJson.blockMonday : false;
        this.blockTuesday = calendarBookJson ? calendarBookJson.blockTuesday : false;
        this.blockWednesday = calendarBookJson ? calendarBookJson.blockWednesday : false;
        this.blockThursday = calendarBookJson ? calendarBookJson.blockThursday : false;
        this.blockFriday = calendarBookJson ? calendarBookJson.blockFriday : false;
        this.blockSaturday = calendarBookJson ? calendarBookJson.blockSaturday : false;
        this.blockSunday = calendarBookJson ? calendarBookJson.blockSunday : false;
        if (calendarBookJson && calendarBookJson.datesBlocked) {
            this.datesBlocked = calendarBookJson.datesBlocked;
        } else {
            this.datesBlocked = new Array<CalendarBookDateInterval>();
        }
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
        const allDays = eachDay(from, to);
        const isBlockedForWeekday = (this.blockMonday && allDays.filter(day => isMonday(day)).length > 0) ||
                                    (this.blockTuesday && allDays.filter(day => isTuesday(day)).length > 0) ||
                                    (this.blockWednesday && allDays.filter(day => isWednesday(day)).length > 0) ||
                                    (this.blockThursday && allDays.filter(day => isThursday(day)).length > 0) ||
                                    (this.blockFriday && allDays.filter(day => isFriday(day)).length > 0) ||
                                    (this.blockSaturday && allDays.filter(day => isSaturday(day)).length > 0) ||
                                    (this.blockSunday && allDays.filter(day => isSunday(day)).length > 0);
        return !isIntervalOverlappingDatesBlocked && !isIntervalOverlappingBookings &&
                !isBlockedForWeekend && !isBlockedForWorkweek &&
                !isBlockedForWeekday;
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
    blockDate(date: Date) {
        this.blockDateInterval(date, date);
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
