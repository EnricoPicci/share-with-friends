import { Injectable } from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs/Rx';

import {CalendarEvent} from 'angular-calendar';

import {CalendarBook} from '../shared/model/calendar-book';
import {UserService} from '../providers/user.service';
import {User} from '../shared/model/user';

@Injectable()
export class CalendarBookViewcontrollerService {

  constructor(private userService: UserService) { }

  getCalendarEventsFromBook(book: CalendarBook) {
    let ret: Observable<Array<CalendarEvent>>;
    const bookings = book.bookings.filter(booking => !booking.isRemoved());
    if (bookings.length === 0) {
      // if there are no bookings we need to create an Observable and return it
      // otherwise the result of Observable.combineLatest() is an observable which completes
      // immediately without having any event raised
      // On the contrary, if there are no bookings we want an event raised with an empty array
      const subject = new ReplaySubject<Array<CalendarEvent>>(1);
      subject.next(new Array<CalendarEvent>());
      subject.complete();
      ret = subject.asObservable();
    } else {
      const userObservables = new Array<Observable<User>>();
      for (const booking of bookings) {
        userObservables.push(this.userService.getUser(booking.userBookingEmail));
      }
      ret = Observable.combineLatest(userObservables).map(users => {
        const calendarEvents = new Array<CalendarEvent>();
        for (let i = 0; i < users.length; i++) {
          const booking = bookings[i];
          const calendarEvent: CalendarEvent = {
            start: booking.from,
            end: booking.to,
            title: users[i].name,
            color: {
                primary: '#ad2121',
                secondary: '#FAE3E3'
            }
          };
          calendarEvents.push(calendarEvent);
        }
        return calendarEvents;
      });
    }
    return ret;
  }

}
