import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription} from 'rxjs/Rx';

import {
  format
} from 'date-fns';

import {
  MyBookingsViewcontrollerService,
  BookingSharablethingOwnerStructure
} from '../view-controllers/my-bookings-viewcontroller.service';
import {Booking} from '../shared/model/booking';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit, OnDestroy {

  bookingSharablethingOwnerStructures: Array<BookingSharablethingOwnerStructure>;

  subscription: Subscription;

  constructor(private myBookingsViewcontrollerService: MyBookingsViewcontrollerService) { }

  ngOnInit() {
    this.subscription = this.myBookingsViewcontrollerService.getBookingsThingsOwnersForCurrentUser()
                                        .map(data => data.sort((a, b) => {
                                          if (a.booking.from > b.booking.from) {
                                            return 1;
                                          } else {
                                            return 0;
                                          }
                                        }))
                                        .subscribe(data => this.bookingSharablethingOwnerStructures = data);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getBookingInfo() {
    return this.bookingSharablethingOwnerStructures.map(structure => {
      return {
        period: this.getPeriod(structure.booking),
        thing: structure.sharableThing.name,
        owner: structure.owner.name,
        status: structure.booking.status
      };
    });
  }
  getPeriod(booking: Booking) {
    return format(booking.from, 'DD/MM/YYYY') +
            ' -- ' +
            format(booking.to, 'DD/MM/YYYY');
  }

}
