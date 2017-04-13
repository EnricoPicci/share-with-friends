
import {CalendarBookDateInterval} from './calendar-book-date-interval';
import {Booking} from './booking';

export interface CalendarBookJsonInterface {
    datesBlocked: Array<CalendarBookDateInterval>;
    blockWeekends: boolean;
    blockWorkweek: boolean;
    // bookings: Array<Booking>;
}
