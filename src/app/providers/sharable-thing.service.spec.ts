import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import { SharableThingService } from './sharable-thing.service';
import { SharableThing } from '../shared/model/sharable-thing';
import { AuthService } from './auth.service';
import {UserService} from './user.service';
import { User } from '../shared/model/user';
import {MailSenderEmailjsService} from './mail-sender-emailjs.service';
import { BookingService } from './booking.service';

import {createUserAndLogin, sleep, userEmail, userPwd} from './test-common-functions';

describe('SharableThingService', () => {
  let sharableThingService: SharableThingService;
  let authService: AuthService;
  let userService: UserService;
  let bookingService: BookingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharableThingService, AuthService, UserService, MailSenderEmailjsService, BookingService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([SharableThingService, AuthService, UserService, BookingService],
                                                    (service1: SharableThingService,
                                                    service2: AuthService,
                                                    service3: UserService,
                                                    service4: BookingService) => {
        sharableThingService = service1;
        authService = service2;
        userService = service3;
        bookingService = service4;
    })();
  });

  it('should have services instanciated', done => {
    expect(sharableThingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(bookingService).toBeTruthy();
    done();
  });



  it('should save a sharable thing offered to some friends and then removes the sharable thing', done => {
    const name = 'a thing for friends';
    const description = 'a thing to share with some friends';
    const images = [];
    const monetaryAmountAmount = 100;
    const theSecondFriendEmail = 'asecondfriend@my.com';
    let theUser: User;
    const theSharableThingOwner = 'fakeowner@my.com';
    createUserAndLogin(authService);
    userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(3500).then(() => {
      // add a sharable thing for some friends
      console.log('after some time .... a sharable thing for for some friends is added');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    theSharableThingOwner, [{email: theUser.email, notified: false},
                                                            {email: theSecondFriendEmail, notified: false}],
                                    false, monetaryAmountAmount);
      sharableThingService.saveSharableThing(sharableThing1).then(() => {
        if (!sharableThing1.$key) {
            console.log('we expect to have a key in the SharableThing', sharableThing1);
            throw new Error('we expect to have a key in the SharableThing');
        }
        console.log('... then I update the sharable thing just created (ADD SHARABLE THING FOR SOME FRIENDs)...');
        sharableThingService.saveSharableThing(sharableThing1).then(() => {
            if (!sharableThing1.$key) {
                console.log('we expect to have a key in the SharableThing', sharableThing1);
                throw new Error('we expect to have a key in the SharableThing');
            }
            console.log('... then I logout (ADD SHARABLE THING FOR SOME FRIENDs)...');
            authService.logout().then(() => {
                console.log('... then I wait some more time (ADD SHARABLE THING FOR SOME FRIENDs)...');
                sleep(1000).then(() => {
                    console.log('... then I login again (ADD SHARABLE THING FOR SOME FRIENDs) ...');
                    authService.login(userEmail, userPwd).then(() => {
                        console.log('... and check if I find the thing that has been offered to me (ADD SHARABLE THING FOR SOME FRIENDs)');
                        // the first() method is used so that the subscriptions are terminated after their first emission
                        const obs1 = userService.getUser(theUser.email).first();
                        const obs2 = userService.getUser(theSecondFriendEmail).first();
                        const obs3 = sharableThingService.loadSharableThing(sharableThing1.$key).first();
                        const obs4 = sharableThingService.loadActiveSharableThingsForOwner(theSharableThingOwner)
                                                        .first()
                                                        .map(things => things[0]);
                        Observable.merge(obs1, obs2, obs3, obs4).subscribe(
                            userOrSharableThing => {
                                if (!(userOrSharableThing instanceof User ||
                                        userOrSharableThing instanceof SharableThing)) {
                                    console.log('we expect only instance of type User or SharableThing', userOrSharableThing);
                                    throw new Error('we expect only instance of type User or SharableThing');
                                } else
                                if (userOrSharableThing instanceof User
                                        && userOrSharableThing.thingsOfferedToMeKeys.length !== 1) {
                                    console.log('the user should have only one thing offered to him', userOrSharableThing);
                                    throw new Error('the user should have only one thing offered to him');
                                } else
                                if (userOrSharableThing instanceof User
                                        && userOrSharableThing.thingsOfferedToMeKeys[0] !== sharableThing1.$key) {
                                    console.log('the user should have this sharabel thing', sharableThing1);
                                    throw new Error('the user has the wrong sharable thing');
                                } else
                                if (userOrSharableThing instanceof SharableThing && userOrSharableThing.$key !== sharableThing1.$key) {
                                    console.log('the sharable thing shuold be this', userOrSharableThing);
                                    throw new Error('the sharable thing is not right');
                                }
                            },
                            err => console.log,
                            () => {
                                console.log('ADD SHARABLE THING FOR SOME FRIENDs TEST PASSED');
                                console.log('... and then remove the sharable thing (ADD SHARABLE THING FOR SOME FRIENDs) ...');
                                sharableThingService.removeSharableThingObs(sharableThing1).subscribe(
                                    val => console.log('remove val ......', val),
                                    err => console.log('err .......', err),
                                    () => {
                                        // tslint:disable-next-line:max-line-length
                                        console.log('... and check that there is no sharable thing any more (ADD SHARABLE THING FOR SOME FRIENDs) ...');
                                        const obs11 = userService.getUser(theUser.email).first();
                                        const obs22 = userService.getUser(theSecondFriendEmail).first();
                                        const obs33 = sharableThingService.loadSharableThing(sharableThing1.$key).first();
                                        Observable.merge(obs11, obs22, obs33).subscribe(
                                            userOrSharableThing => {
                                                if (!(userOrSharableThing instanceof User ||
                                                        userOrSharableThing instanceof SharableThing)) {
                                                    console.log('we ex[ect only instance of type User or SharableThing',
                                                                userOrSharableThing);
                                                    throw new Error('we ex[ect only instance of type User or SharableThing');
                                                }
                                                // tslint:disable-next-line:one-line
                                                else if (userOrSharableThing instanceof User
                                                        && userOrSharableThing.thingsOfferedToMeKeys.length !== 0) {
                                                    console.log('the user should have no things offered to him', userOrSharableThing);
                                                    throw new Error('the user should have no things offered to him');
                                                }
                                                // tslint:disable-next-line:one-line
                                                else if (userOrSharableThing instanceof SharableThing &&
                                                    userOrSharableThing.removed === false) {
                                                    console.log('the sharable thing is not right', userOrSharableThing);
                                                    throw new Error('the sharable thing is not right');
                                                }
                                            },
                                            err => console.log(err),
                                            () => {
                                                console.log('REMOVE SHARABLE THING FROM SOME FRIENDs TEST PASSED');
                                            }
                                        );
                                    }
                                );
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


  // Test the following sequence
  // 1) LOGIN
  // 2) CREATE A NEW SHARABLE-THING
  // 3) LOGOUT
  // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
  // 5) BOOK A PERIOD ON THE SHARABLE THING
  // 6) LOGOUT
  // 7) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
  // 8) TRY TO BOOK A PERIOD OVERLAPPING AND GET A REFUSAL
  // 9) BOOK A FREE PERIOD
  // 10) LOGOUT
  // 11) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
  // 12) SEE YOUR BOOKING
    const testName = 'AAAAA - TEST A BOOKING ON A SHARABLE THING';
  it(testName, done => {
    const name = 'a thing to book';
    const description = 'a thing to be be booked in the test';
    const images = [];
    const monetaryAmountAmount = 60;
    const theFriendWhoWillBookEmail = 'afriendwhobooks@my.com';
    let theUser: User;
    const theSharableThingOwnerEmail = 'owner-who-shares@my.com';
    // createUserAndLogin(authService, 'friend-who-books@your.com');
    createUserAndLogin(authService, theSharableThingOwnerEmail);
    // 1) LOGIN
    userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(10000).then(() => { // 00
        // 2) CREATE A NEW SHARABLE-THING
      // create a sharable thing for a friend who will later book it
      console.log(testName + ' ... after some time a sharable thing for a friend who will later book it is added');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    theSharableThingOwnerEmail, [{email: theFriendWhoWillBookEmail, notified: false}],
                                    false, monetaryAmountAmount);
      sharableThingService.saveSharableThing(sharableThing1).then(() => { // 01
        if (!sharableThing1.$key) {
            console.log(testName + ' ... we expect to have a key in the SharableThing', sharableThing1);
            throw new Error(testName + ' we expect to have a key in the SharableThing');
        }
            // 3) LOGOUT
        console.log(testName + ' ... then I logout');
        authService.logout().then(() => { // 02
            console.log(testName + ' ... then I wait some more time');
            sleep(800).then(() => { // 03
                    // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                console.log(testName + ' ... then I login again with the credentials of the friend');
                createUserAndLogin(authService, theFriendWhoWillBookEmail);
                userService.currentUser$.filter(user => user !== null).first().subscribe(user => { // 04
                    theUser = user;
                        // 5) BOOK A PERIOD ON THE SHARABLE THING
                    console.log(testName + ' ... and book a period');
                    const numberOfThingsOfferedToMe = theUser.thingsOfferedToMeKeys.length;
                    if (numberOfThingsOfferedToMe < 1) {
                        console.log(testName + ' we expect to have at least one SharableThing offered to the user ', theUser);
                        throw new Error(testName + ' we expect to have at least one SharableThing offered to the user ');
                    }
                    const lastThingOfferedToMeKey = theUser.thingsOfferedToMeKeys[numberOfThingsOfferedToMe - 1];
                    console.log(testName + ' lastThingOfferedToMeKey', lastThingOfferedToMeKey);
                    // first is used so that the subscription is terminated after their first emission
                    // this is mandatory - without it we enter an infinite loop since loadSharableThing loads also the bookings
                    // therefore, if the bookingList changes (and it changes when a booking is added) then the loadSharableThing
                    // subscription is executed again, unless it is closed after the firt emission
                    sharableThingService.loadSharableThing(lastThingOfferedToMeKey).first().subscribe(thingOfferedToMe => {  // 05
                        const from1 = new Date(2020, 3, 14);
                        const to1 = new Date(2020, 3, 16);
                        const booking1 = thingOfferedToMe.addBooking(from1, to1, theUser.email);
                        bookingService.saveBooking(booking1).then(() => {  // 06
                                // 6) LOGOUT
                            console.log(testName + ' ... then I logout for the second time');
                            authService.logout().then(() => {  // 07
                                    // 7) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                                console.log(testName + ' ... then I login the second time as the friend who has been offered the thing');
                                authService.login(theFriendWhoWillBookEmail, userPwd).then(() => { // 08
                                        // 8) TRY TO BOOK A PERIOD OVERLAPPING AND GET A REFUSAL
                                    const from2 = to1;
                                    const to2 = new Date(2020, 3, 20);
                                    console.log(testName + ' ... then I to book a second booking but fail since the period is not free');
                                    const booking2 = thingOfferedToMe.addBooking(from2, to2, theUser.email);
                                    if (booking2) {
                                        console.log(testName + ' we expect the booking to be null since it overlaps a previous booking');
                                        throw new Error(testName + ' the booking should be null since it overlaps a previous booking');
                                    }
                                        // 9) BOOK A FREE PERIOD
                                    const from3 = new Date(2020, 4, 10);
                                    const to3 = new Date(2020, 4, 15);
                                    console.log(testName + ' ... then I to book a third booking and succeed');
                                    const booking3 = thingOfferedToMe.addBooking(from3, to3, theUser.email);
                                    if (!booking3) {
                                        console.log(testName + ' the booking should be NOT null since it overlaps a previous booking');
                                        throw new Error(testName + ' we expect the booking NOT null since it overlaps a previous booking');
                                    }
                                    bookingService.saveBooking(booking3).then(() => { // 09
                                            // 10) LOGOUT
                                        console.log(testName + ' ... then I logout for the third time');
                                        authService.logout().then(() => { // 10
                                                // 11) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                                            console.log(testName + ' ... then I login for the third time as the friend');
                                            authService.login(theFriendWhoWillBookEmail, userPwd);
                                            userService.currentUser$.subscribe(userFriend => { // 11
                                                    // 12) SEE YOUR BOOKING
                                                const numberOfThingsOfferedToMe1 = userFriend.thingsOfferedToMeKeys.length;
                                                const lastThingKey1 = userFriend.thingsOfferedToMeKeys[numberOfThingsOfferedToMe1 - 1];
                                                sharableThingService.loadSharableThing(lastThingKey1).first().subscribe(thing => { // 12
                                                    const calendarBook = thing.getCalendarBook();
                                                    const numberOfBookings = calendarBook.bookings.length;
                                                    const lastBooking = calendarBook.bookings[numberOfBookings - 1];
                                                    console.log('TTTHHHHHEEEEE BBBBBOOOOOKKKK', calendarBook, lastBooking);
                                                    if (lastBooking.from.toDateString() !== from3.toDateString()
                                                        || lastBooking.to.toDateString() !== to3.toDateString()) {
                                                        const errorMsg = ' the booking dates are not those expected';
                                                        console.log(testName + errorMsg, lastBooking, from3, to3);
                                                        throw new Error(testName + errorMsg);
                                                    }
                                                    authService.logout();
                                                }); // 12
                                            }); // 11
                                        }); // 10
                                    }); // 09
                                }); // 08
                            });  // 07
                        });  // 06
                    }); // 05
                }); // 04
            }); // 03
        }); // 02
      }); // 01
    }); // 00
    done();
  });

});
