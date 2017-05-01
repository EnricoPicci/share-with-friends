import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject, Subscription } from 'rxjs/Rx';
import {MdDialog, MdDialogRef, MdDialogConfig} from '@angular/material';
import {
  isPast,
  isSameDay,
  addMonths,
  subMonths,
  format
} from 'date-fns';

import {CalendarEvent, CalendarDateFormatter} from 'angular-calendar';
import {MonthViewDay} from 'calendar-utils';
import 'intl';
import 'intl/locale-data/jsonp/en';
import 'intl/locale-data/jsonp/it';

import {SharableThing} from '../shared/model/sharable-thing';
import {CalendarBook} from '../shared/model/calendar-book';
import { CalendarBookViewcontrollerService } from '../view-controllers/calendar-book-viewcontroller.service';
import {CalendarDialogComponent} from './calendar-dialog.component';
import {CalendarShortDateFormatter} from './calendar-short-date-formatter';
import {User} from '../shared/model/user';
import {BookingService} from '../providers/booking.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-showcase-calendar',
  template: `
              <md-progress-spinner mode="indeterminate" class="spinner" *ngIf="!_events"></md-progress-spinner>
              <div fxLayout="row">
                <div fxFlex="100%" class="flexitem month">{{getMonthYer()}}</div>
              </div>
              <div fxLayout="row" *ngIf="thing">
                <button class="cal-button" fxFlex="5%" (click)="previousMonth()">\<</button>
                <mwl-calendar-month-view fxFlex="90%"
                  [viewDate]="viewDate"
                  [events]="_events"
                  (dayClicked)="dayClicked($event.day)"
                  [refresh]="refresh"
                  [dayModifier]="dayModifier">
                </mwl-calendar-month-view>
                <button class="cal-button" fxFlex="5%" (click)="nextMonth()">\></button>
              </div>
            `,
  styleUrls: ['./sharable-thing-showcase-calendar.component.css'],
  providers: [{
    provide: CalendarDateFormatter,
    useClass: CalendarShortDateFormatter
  }]
})
export class SharableThingShowcaseCalendarComponent implements OnInit, OnDestroy {
  thing: SharableThing;
  viewDate: Date = new Date();
  _events: Array<CalendarEvent>;
  refresh: Subject<any> = new Subject();
  subscription: Subscription;

  firstBookingDateSet: Date;

  // // if this calendar view is used to block dates (by the owner of the sharable thing) rather than book periods
  // // by friends of the
  // forBlockingDates = false;

  // testDate: Intl.DateTimeFormat;
  @Input() user: User;

  constructor(
                private calendarBookViewcontrollerService: CalendarBookViewcontrollerService,
                public dialog: MdDialog,
                private bookingService: BookingService
              ) { }

  @Input('sharableThing') set sharableThing(thing: SharableThing) {
    this.thing = thing;
    if (thing) {
      this.subscription = this.calendarBookViewcontrollerService.getCalendarEventsFromBook(thing.getCalendarBook())
        .subscribe(events => {
          this._events = events;
        });
    }
  };

  ngOnInit() {
    // this.testDate = new Intl.DateTimeFormat();
    // console.log('Intl.DateTimeFormat()', this.testDate);
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  dayClicked({date, events}: {date: Date, events: CalendarEvent[]}): void {
    if (isPast(date)) {
      // ignore clicks on past days
      const message = 'Day in the past';
      this.warning(message);
      return;
    }
    const book = this.thing.getCalendarBook();
    if (!book.isDateFree(date) && !this.firstBookingDateSet) {
      // ignore clicks on days which are not free and it is the first date chosen of the date interval
      const message = 'The day is is not available';
      this.warning(message);
      return;
    }
    if (!this.firstBookingDateSet) {
      this.firstBookingDateSet = date;
    } else {
      const startDate = (this.firstBookingDateSet < date) ? this.firstBookingDateSet : date;
      const endDate = (startDate === date) ? this.firstBookingDateSet : date;
      if (!book.isDateIntervalFree(startDate, endDate)) {
        const message = 'The period is not free';
        this.warning(message);
        return;
      }
      // if the user of the app is the owner of the sharable thing, then he blocks dates and does not make bookings
      if (this.user && (this.user.email === this.thing.ownerEmail)) {
        console.log('THIS IS A BLOCK OF DATES');
        this.thing.getCalendarBook().blockDateInterval(startDate, endDate);
      } else {
        const booking = this.thing.addBooking(startDate, endDate, this.user.email);
        this.bookingService.saveBooking(booking);
      }
      this.firstBookingDateSet = null;
    }
    this.refresh.next();
  }
  warning(message: string) {
    const config: MdDialogConfig = {
      data: {message}
    };
    const dialogRef = this.dialog.open(CalendarDialogComponent, config);
    dialogRef.afterClosed().subscribe(() => {
      this.firstBookingDateSet = null;
      this.refresh.next();
    });
  }

  dayModifier = (dayCell: MonthViewDay) => {
    dayCell.badgeTotal = 0;
    const date = dayCell.date;
    if (isSameDay(date, this.firstBookingDateSet)) {
      dayCell.cssClass = 'cal-day-to-be-booked-cell';
    }
    if (!isPast(date) && !this.thing.getCalendarBook().isDateFree(date)) {
      dayCell.cssClass = 'cal-day-blocked';
    }
  }

  previousMonth() {
    this.viewDate = subMonths(this.viewDate, 1);
  }
  nextMonth() {
    this.viewDate = addMonths(this.viewDate, 1);
  }
  getMonthYer() {
    return format(this.viewDate, 'MMMM YYYY');
  }

  refreshView() {
    this.refresh.next();
  }

}
