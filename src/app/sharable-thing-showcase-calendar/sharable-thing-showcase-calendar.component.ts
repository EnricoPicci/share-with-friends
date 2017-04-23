import { Component, OnInit, Input } from '@angular/core';
import { Subject } from 'rxjs/Rx';

import {CalendarEvent} from 'angular-calendar';

import {CalendarBook} from '../shared/model/calendar-book';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-showcase-calendar',
  templateUrl: './sharable-thing-showcase-calendar.component.html',
  styleUrls: ['./sharable-thing-showcase-calendar.component.css']
})
export class SharableThingShowcaseCalendarComponent implements OnInit {
  viewDate: Date = new Date();
  _events = new Array<CalendarEvent>();
  refresh: Subject<any> = new Subject();

  @Input('calendarBook') set calendarBook(book: CalendarBook) {
    const bookings = book.bookings.filter(booking => !booking.isRemoved());
    for (const booking of bookings) {
      const calendarEvent: CalendarEvent = {
        start: booking.from,
        end: booking.to,
        title: booking.userBookingEmail,
        color: {
            primary: '#ad2121',
            secondary: '#FAE3E3'
        }
      };
    }
    // this._events
  };

  constructor() { }

  ngOnInit() {
  }

}
