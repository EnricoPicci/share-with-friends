import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import { BookingService } from './booking.service';
import { Booking } from '../shared/model/booking';
import { AuthService } from './auth.service';
import {UserService} from './user.service';
import { User } from '../shared/model/user';
import { SharableThingService } from './sharable-thing.service';
import {SharableThing} from '../shared/model/sharable-thing';
import {MailSenderEmailjsService} from './mail-sender-emailjs.service';

import {createUserAndLogin, sleep, userEmail, userPwd} from './test-common-functions';

describe('BookingService', () => {
  let bookingService: BookingService;
  let authService: AuthService;
  let userService: UserService;
  let sharableThingService: SharableThingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingService, AuthService, UserService, SharableThingService, MailSenderEmailjsService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([BookingService, AuthService, UserService, SharableThingService], (service1: BookingService,
                                                    service2: AuthService,
                                                    service3: UserService,
                                                    service4: SharableThingService) => {
        bookingService = service1;
        authService = service2;
        userService = service3;
        sharableThingService = service4;
    })();
  });

  it('should have services instanciated', done => {
    expect(bookingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    done();
  });


  it('saves a booking, finds it per user and sharable thing and then removes it', done => {
    // sharable thing data
    const name = 'a thing for friends';
    const description = 'a thing to share with some friends';
    const images = [];
    const monetaryAmountAmount = 100;
    const bookerEmail = 'booking.test.booker@my.com';
    const friendEmail = 'booking.test.asecondfriend@my.com';
    const bookerEmailObj = {email: bookerEmail, notified: false};
    const friendEmailObj = {email: friendEmail, notified: false};
    // booking data
    const fromDate = new Date(2017, 2, 2);
    const toDate = new Date(2017, 2, 2);
    createUserAndLogin(authService);
    userService.currentUser$.filter(user => user !== null).first().subscribe();
    sleep(4500).then(() => {
      // add a sharable thing I want to book
      console.log('START ADD BOOKING TEST');
      console.log('(ADD BOOKING)  Create a sharable thing to be booked later ...');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    'fakeowner1@my.com', [friendEmailObj, bookerEmailObj], false, monetaryAmountAmount);
      sharableThingService.saveSharableThing(sharableThing1).then(() => {
        console.log('(ADD BOOKING)  ... then I logout ...');
        authService.logout().then(() => {
          console.log('(ADD BOOKING) ... then I wait some more time ...');
          sleep(1000).then(() => {
            console.log('(ADD BOOKING) ... then I login again ...');
            authService.login(userEmail, userPwd).then(() => {
                console.log('(ADD BOOKING) ... and create and save a booking ...');
                const booking = new Booking(null, fromDate, toDate, sharableThing1.$key, bookerEmail, false);
                bookingService.saveBooking(booking).then(() => {
                  let theBookingsReadForUserEmail: Booking[];
                  let theBookingsReadForSharableThingKey: Booking[];
                  // first() operator is added just to ensure that the Observable returned by loadBookingsFor... methods
                  // are completed so that the test case can proceed with the 'complete' callback
                  const obs1 = bookingService.loadBookingsForUserEmail(bookerEmail).first();
                  const obs2 = bookingService.loadBookingsForSharableThingKey(sharableThing1.$key).first();
                  Observable.combineLatest(obs1, obs2)
                    .subscribe(
                      bookingsRead => {
                        theBookingsReadForUserEmail = bookingsRead[0];
                        theBookingsReadForSharableThingKey = bookingsRead[1];
                      },
                      err => console.log(err),
                      () => {
                        const theBookingForUser = theBookingsReadForUserEmail
                                                  .filter(bkng => bkng.$key === booking.$key);
                        if (theBookingForUser.length !== 1) {
                          const errMsg = 'the bookings retrieved from back end do not contain the saved booking';
                          console.log(errMsg, theBookingsReadForUserEmail, booking);
                          throw new Error(errMsg);
                        }
                        const theBookingForSharableThing = theBookingsReadForSharableThingKey
                                                            .filter(bkng => bkng.sharableThingKey === booking.sharableThingKey);
                        if (theBookingForSharableThing.length !== 1) {
                          const errMsg = 'the bookings retrieved from back end do not contain the saved booking';
                          console.log(errMsg, theBookingsReadForSharableThingKey, booking);
                          throw new Error(errMsg);
                        }
                        const theBookingRetrieved = theBookingForSharableThing[0];
                        console.log('READ BOOKING TEST PASSED');
                        console.log('(ADD BOOKING) ... and remove the booking created ...');
                        bookingService.removeBooking(theBookingRetrieved).then(() => {
                          // first() operator is added just to ensure that the Observable returned by loadBookingsFor... methods
                          // are completed so that the test case can proceed with the 'complete' callback
                          const obs11 = bookingService.loadBookingsForUserEmail(bookerEmail).first();
                          const obs22 = bookingService.loadBookingsForSharableThingKey(sharableThing1.$key).first();
                          Observable.combineLatest(obs11, obs22)
                            .subscribe(
                              bookingsRead => {
                                theBookingsReadForUserEmail = bookingsRead[0];
                                theBookingsReadForSharableThingKey = bookingsRead[1];
                              },
                              err => console.log(err),
                              () => {
                                const theBookingForUser1 = theBookingsReadForUserEmail
                                                          .filter(bkng => bkng.$key === booking.$key)
                                                          .filter(bkng => !bkng.removed);
                                if (theBookingForUser1.length !== 0) {
                                  const errMsg = 'there are active bookings retrieved from back end while we expect none';
                                  console.log(errMsg, theBookingsReadForUserEmail, booking);
                                  throw new Error(errMsg);
                                }
                                const theBookingForSharableThing1 = theBookingsReadForSharableThingKey
                                                                    .filter(bkng => bkng.sharableThingKey === booking.sharableThingKey)
                                                                    .filter(bkng => !bkng.removed);
                                if (theBookingForSharableThing1.length !== 0) {
                                  const errMsg = 'there are active bookings retrieved from back end while we expect none';
                                  console.log(errMsg, theBookingsReadForSharableThingKey, booking);
                                  throw new Error(errMsg);
                                }
                                console.log('REMOVE BOOKING TEST PASSED');
                                // perform some cleanup
                                sharableThingService.removeSharableThing(sharableThing1);

                              }
                            );
                        });
                      }
                    );
                });
            });
          });
        });
      });
    });
    done();
  });

});
