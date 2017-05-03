import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Rx';

import {Booking} from '../shared/model/booking';
import {SharableThing} from '../shared/model/sharable-thing';
import {User} from '../shared/model/user';
import { BookingService } from '../providers/booking.service';
import { SharableThingService } from '../providers/sharable-thing.service';
import { UserService } from '../providers/user.service';

export interface BookingSharablethingOwnerStructure {
  booking: Booking;
  sharableThing: SharableThing;
  owner: User;
}

@Injectable()
export class MyBookingsViewcontrollerService {

  constructor(
    private bookingService: BookingService,
    private sharableThingService: SharableThingService,
    private userService: UserService
  ) { }

  getBookingsThingsOwnersForCurrentUser() {
    return this.userService.currentUser$.switchMap(currentUser => this.getBookingsThingsOwners(currentUser.email));
  }
  getBookingsThingsOwners(userEmail: string) {
    let ret: Observable<Array<BookingSharablethingOwnerStructure>>;
    ret = this.bookingService.loadBookingsForUserEmail(userEmail)
          .switchMap(bookings => {
            const uniqueThingIds = new Set<string>();
            bookings.map(booking => {
              uniqueThingIds.add(booking.sharableThingKey);
            });
            const thingObservables = new Array<Observable<SharableThing>>();
            uniqueThingIds.forEach(thingId => {
              const obs = this.sharableThingService.loadSharableThing(thingId);
              thingObservables.push(obs);
            });
            return Observable.combineLatest(thingObservables).map(things => {
              const bookingsThings = bookings.map(booking => {
                const theThing = things.filter(thing => thing.$key === booking.sharableThingKey)[0];
                return {booking, sharableThing: theThing, owner: null};
              });
              return {things, bookingsThings};
            });
          })
          .switchMap(thingsBookings => {
            const things = thingsBookings.things;
            const uniqueOwnersEmails = new Set<string>();
            things.map(thing => {
              uniqueOwnersEmails.add(thing.ownerEmail);
            });
            const ownerObservables = new Array<Observable<User>>();
            uniqueOwnersEmails.forEach(ownerEmai => {
              const obs = this.userService.getUser(ownerEmai);
              ownerObservables.push(obs);
            });
            return Observable.combineLatest(ownerObservables).map(owners => {
              const bookingsThings = thingsBookings.bookingsThings;
              const bookingsThingsOwners = bookingsThings.map(bookingThing => {
                const theOwner = owners.filter(owner => owner.email === bookingThing.sharableThing.ownerEmail)[0];
                bookingThing.owner = theOwner;
                return bookingThing;
              });
              return bookingsThingsOwners;
            });
          });
    return ret;
  }

}
