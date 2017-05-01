
import {CalendarBookDateInterval} from './calendar-book-date-interval';
import {Booking} from './booking';

export interface CalendarBookJsonInterface {
    datesBlocked: Array<CalendarBookDateInterval>;
    // blockWeekends: boolean;
    // blockWorkweek: boolean;
    blockMonday: boolean;
    blockTuesday: boolean;
    blockWednesday: boolean;
    blockThursday: boolean;
    blockFriday: boolean;
    blockSaturday: boolean;
    blockSunday: boolean;
    // bookings: Array<Booking>;
}
