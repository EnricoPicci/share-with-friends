import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import * as firebase from 'firebase';
import {Subject, Observable} from 'rxjs/Rx';

import {environment} from '../../environments/environment';
import {firebaseConfig} from '../../environments/firebase.config';
import {Booking} from '../shared/model/booking';

const BOOKINGS = '/bookings/';

@Injectable()
export class BookingService {

  constructor(private af: AngularFire) { }

  loadBookingsForUserEmail(userEmail: string) {
    return this.af.database.list(this.getFirebaseRef(), {
      query: {
        orderByChild: 'userBookingEmail',
        equalTo: userEmail
      }
    }).map(Booking.fromJsonArray);
  }
  loadBookingsForSharableThingKey(key: string) {
    return this.af.database.list(this.getFirebaseRef(), {
      query: {
        orderByChild: 'sharableThingKey',
        equalTo: key
      }
    }).map(Booking.fromJsonArray);
  }

  saveBooking(booking: Booking) {
    let ret: firebase.Thenable<any>;
    const listObservable =  this.af.database.list(this.getFirebaseRef());
    if (!booking.$key) {
      delete booking.$key;
      ret = listObservable.push(booking).then((item) => {
        booking.$key = item.key;
      });
    } else {
      ret = listObservable.update(booking.$key, booking);
    }
    return ret;
  }

  removeBooking(booking: Booking) {
    return this.af.database.list(this.getFirebaseRef()).update(booking.$key, {'removed': true});
  }
  // implements the logic using the Observable pattern
  // requires client to subscribe in order for the logic to be activated
  removeBookingObs(booking: Booking) {
    const subject = new Subject();
    this.af.database.list(this.getFirebaseRef()).update(booking.$key, {'removed': true})
      .then(
          () => {
              subject.next(null);
              subject.complete();

          },
          err => {
              subject.error(err);
              subject.complete();
          }
      );
    return subject.asObservable();
  }


  private getFirebaseRef() {
    return '/' + environment.db + BOOKINGS;
  }

}
