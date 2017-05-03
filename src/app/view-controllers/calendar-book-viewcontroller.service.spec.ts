import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import { AuthService } from '../providers/auth.service';
import {UserService} from '../providers/user.service';
import { User } from '../shared/model/user';
import { BookingService } from '../providers/booking.service';
import { SharableThingService } from '../providers/sharable-thing.service';
import { SharableThing } from '../shared/model/sharable-thing';
import {MailSenderEmailjsService} from '../providers/mail-sender-emailjs.service';

import {createUserAndLogin, sleep, userEmail, userPwd, login} from '../providers/test-common-functions';

import { CalendarBookViewcontrollerService } from './calendar-book-viewcontroller.service';

describe('CalendarBookViewcontrollerService', () => {
  let calendarBookViewcontrollerService: CalendarBookViewcontrollerService;
  let bookingService: BookingService;
  let authService: AuthService;
  let userService: UserService;
  let sharableThingService: SharableThingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, UserService, CalendarBookViewcontrollerService,
                    BookingService, SharableThingService, MailSenderEmailjsService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([BookingService, AuthService, UserService, CalendarBookViewcontrollerService, SharableThingService],
                                                    (service1: BookingService,
                                                    service2: AuthService,
                                                    service3: UserService,
                                                    service4: CalendarBookViewcontrollerService,
                                                    service5: SharableThingService) => {
        bookingService = service1;
        authService = service2;
        userService = service3;
        calendarBookViewcontrollerService = service4;
        sharableThingService = service5;
    })();
  });

  it('should have services instanciated', done => {
    expect(bookingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(calendarBookViewcontrollerService).toBeTruthy();
    expect(sharableThingService).toBeTruthy();
    done();
  });



  // Test the following sequence
  // 1) LOGIN WITH THE CREDENTIALS OF  THE OWNER OF A THING
  // 2) CREATE A NEW SHARABLE-THING AND SHARE IT WITH 3 FRIENDS
  // 2.1) CREATE A NEW SHARABLE-THING WHICH HAS NO BOOKINGS
  // 3) LOGOUT
  // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FIRST FRIEND
  // 5) GET THE ACTIVE SHARABLE THINGS FOR THE FIRST FRIEND
  // 6) MAKE 1 BOOKING
  // 7) LOGOUT
  // 8) LOGIN WITH THE CREDENTIALS OF THE SECOND FRIEND
  // 9) GET THE ACTIVE SHARABLE THINGS FOR THE SECOND FRIEND
  // 10) MAKE 2 BOOKINGS
  // 11) LOGOUT
  // 12) LOGIN WITH THE CREDENTIALS OF THE THIRD FRIEND
  // 13) GET THE ACTIVE SHARABLE THINGS FOR THE THIRD FRIEND
  // 14) MAKE 3 BOOKINGS
  // 15) LOGOUT
  // 16) LOGIN WITH THE CREDENTIALS OF  THE OWNER OF THE THING
  // 17) GET THE SHARABLE THING CREATED BEFORE
  // 18) GET THE CALENDAR EVENTS AND CHECK THE THE USERS ARE CORRECT
  // 19) GET THE SHARABLE THING WITH NO BOOKINGS CREATED BEFORE
  // 20) GET THE CALENDAR EVENTS FOR THE THING WITH NO BOOKINGS AND CHECK THAT IT IS EMPTY
    const testName = 'CCCCCCC - TEST THE CALENDAR EVENTS CREATED FROM A CALENDAR BOOK';
  it(testName, done => {
    const name = 'a thing to share with three friends';
    const description = 'a thing to be shared with three friends in the test ' + testName;
    const images = [];
    const monetaryAmountAmount = 40;
    const theFriendEmail1 = 'afriendforcalendar1@my.com';
    const theFriendName1 = 'afriendforcalendar1';
    const theFriendEmail2 = 'afriendforcalendar2@my.com';
    const theFriendName2 = 'afriendforcalendar2';
    const theFriendEmail3 = 'afriendforcalendar3@my.com';
    const theFriendName3 = 'afriendforcalendar3';
    let theUser: User;
    const theSharableThingOwnerEmail = 'owner-who-shares-forcalendar@my.com';
    let theSharableThingKey1: string;
    let theSharableThingKey2: string;


        // 1) LOGIN
    createUserAndLogin(authService, theSharableThingOwnerEmail);
    userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(20000).then(() => { // 00
        // 2) CREATE A NEW SHARABLE-THING
      // create a sharable thing for 3 friends who will later book it
      console.log(testName + ' ... after some time create a sharable thing 111111 for 3 friends');
      const sharableThing = new SharableThing(null, name, description, [],
                                    theSharableThingOwnerEmail,
                                    [
                                      {email: theFriendEmail1, notified: false},
                                      {email: theFriendEmail2, notified: false},
                                      {email: theFriendEmail3, notified: false},
                                    ],
                                    false, {amount: monetaryAmountAmount});
      sharableThingService.saveSharableThing(sharableThing).then(() => { // 01
      theSharableThingKey1 = sharableThing.$key;
      console.log(testName + ' THE SHARABLE KEY 11111111', theSharableThingKey1);
        // 2.1) CREATE A NEW SHARABLE-THING WHICH HAS NO BOOKINGS
      // create a sharable thing for 3 friends who will later book it
      console.log(testName + ' ... after some time a sharable thing 222222 for no friends');
      const sharableThingWithNoBookings = new SharableThing(null, name, description, [],
                                    theSharableThingOwnerEmail,
                                    [
                                      {email: theFriendEmail1, notified: false},
                                      {email: theFriendEmail2, notified: false},
                                      {email: theFriendEmail3, notified: false},
                                    ],
                                    false, {amount: monetaryAmountAmount});
        sharableThingService.saveSharableThing(sharableThingWithNoBookings).then(() => { // 01.1
          theSharableThingKey2 = sharableThingWithNoBookings.$key;
          console.log(testName + ' THE SHARABLE KEY 2222222', theSharableThingKey2);
          if (!sharableThing.$key) {
              console.log(testName + ' ... we expect to have a key in the SharableThing', sharableThing);
              throw new Error(testName + ' we expect to have a key in the SharableThing');
          }
              // 3) LOGOUT
          console.log(testName + ' ... then I logout');
          authService.logout().then(() => { // 02
            console.log(testName + ' ... then I wait some more time');
            sleep(1000).then(() => { // 03
                  // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FIRST FRIEND
              console.log(testName + ' ... then I login again with the credentials of the first friend');
              createUserAndLogin(authService, theFriendEmail1, theFriendName1);
              userService.currentUser$.filter(user1 => user1 !== null).first().subscribe(user1 => { // 04
                theUser = user1;
                    // 5) GET THE ACTIVE SHARABLE THINGS FOR ME, I.E. THE FIRST FRIEND
                console.log(testName + ' ... get the active things offered to me ');
                const sub1 = sharableThingService.loadActiveSharableThingsForFriend(theUser).subscribe(sharableThings1 => { // 05
                  const lastIndexOfThingsOfferedToMe1 = sharableThings1.length - 2;
                  // if (numberOfThingsOfferedToMe1 !== 1) {
                  //     const errMessage = 'we expect to have one SharableThing offered to the user ';
                  //     console.log(testName + errMessage, theUser, sharableThings1);
                  //     throw new Error(testName + errMessage);
                  // }
                  // if (sharableThings1[0].description !== description) {
                  //     const errMessage = 'we expect to have the SharableThing which was added at the beginning ';
                  //     console.log(testName + errMessage, theUser, sharableThings1);
                  //     throw new Error(testName + errMessage);
                  // }
                  sub1.unsubscribe();
                    // 6) MAKE 1 BOOKING
                  let bkng;
                  bkng = sharableThings1[lastIndexOfThingsOfferedToMe1]
                          .addBooking(new Date(2017, 2, 2), new Date(2017, 2, 4), theUser.email);
                  bookingService.saveBooking(bkng);
                    // 7) LOGOUT
                  console.log(testName + ' ... then I logout');
                  authService.logout().then(() => { // 06
                    console.log(testName + ' ... then I wait some more time');
                    sleep(1000).then(() => { // 07
                        // 8) LOGIN AGAIN WITH THE CREDENTIALS OF THE SECOND FRIEND
                      console.log(testName + ' ... then I login again with the credentials of the second friend');
                      createUserAndLogin(authService, theFriendEmail2, theFriendName2);
                      userService.currentUser$.filter(user2 => user2 !== null).first().subscribe(user2 => { // 08
                        theUser = user2;
                            // 9) GET THE ACTIVE SHARABLE THINGS FOR ME, I.E. THE SECOND FRIEND
                        console.log(testName + ' ... get the active things offered to me ');
                        const sub2 = sharableThingService.loadActiveSharableThingsForFriend(theUser).subscribe(sharableThings2 => { // 09
                          const lastIndexOfThingsOfferedToMe2 = sharableThings2.length - 2;
                          // if (numberOfThingsOfferedToMe2 !== 1) {
                          //     const errMessage = 'we expect to have one SharableThing offered to the user ';
                          //     console.log(testName + errMessage, theUser, sharableThings2);
                          //     throw new Error(testName + errMessage);
                          // }
                          // if (sharableThings2[0].description !== description) {
                          //     const errMessage = 'we expect to have the SharableThing which was added at the beginning ';
                          //     console.log(testName + errMessage, theUser, sharableThings2);
                          //     throw new Error(testName + errMessage);
                          // }
                          sub2.unsubscribe();
                            // 10) MAKE 2 BOOKINGS
                          bkng = sharableThings2[lastIndexOfThingsOfferedToMe2]
                                      .addBooking(new Date(2018, 2, 2), new Date(2018, 2, 4), theUser.email);
                          bookingService.saveBooking(bkng);
                          bkng = sharableThings2[lastIndexOfThingsOfferedToMe2]
                                      .addBooking(new Date(2018, 2, 6), new Date(2018, 2, 8), theUser.email);
                          bookingService.saveBooking(bkng);
                          bkng = sharableThings2[lastIndexOfThingsOfferedToMe2];
                            // 11) LOGOUT
                          console.log(testName + ' ... then I logout');
                          authService.logout().then(() => { // 10
                            console.log(testName + ' ... then I wait some more time');
                            sleep(1000).then(() => { // 11
                                // 12) LOGIN AGAIN WITH THE CREDENTIALS OF THE THIRD FRIEND
                              console.log(testName + ' ... then I login again with the credentials of the third friend');
                              createUserAndLogin(authService, theFriendEmail3, theFriendName3);
                              userService.currentUser$.filter(user3 => user3 !== null).first().subscribe(user3 => { // 12
                                theUser = user3;
                                    // 13) GET THE ACTIVE SHARABLE THINGS FOR ME, I.E. THE THIRD FRIEND
                                console.log(testName + ' ... get the active things offered to me ');
                                const sub3 = sharableThingService.loadActiveSharableThingsForFriend(theUser)
                                .subscribe(sharableThings3 => { // 13
                                  const lastIndexOfThingsOfferedToMe3 = sharableThings3.length - 2;
                                  // if (numberOfThingsOfferedToMe3 !== 1) {
                                  //     const errMessage = 'we expect to have one SharableThing offered to the user ';
                                  //     console.log(testName + errMessage, theUser, sharableThings3);
                                  //     throw new Error(testName + errMessage);
                                  // }
                                  // if (sharableThings3[0].description !== description) {
                                  //     const errMessage = 'we expect to have the SharableThing which was added at the beginning ';
                                  //     console.log(testName + errMessage, theUser, sharableThings3);
                                  //     throw new Error(testName + errMessage);
                                  // }
                                  sub3.unsubscribe();
                                    // 14) MAKE 3 BOOKINGS
                                  bkng = sharableThings3[lastIndexOfThingsOfferedToMe3]
                                              .addBooking(new Date(2019, 2, 2), new Date(2019, 2, 4), theUser.email);
                                  bookingService.saveBooking(bkng);
                                  bkng = sharableThings3[lastIndexOfThingsOfferedToMe3]
                                              .addBooking(new Date(2019, 2, 6), new Date(2019, 2, 8), theUser.email);
                                  bookingService.saveBooking(bkng);
                                  bkng = sharableThings3[lastIndexOfThingsOfferedToMe3]
                                              .addBooking(new Date(2019, 2, 10), new Date(2019, 2, 12), theUser.email);
                                  bookingService.saveBooking(bkng);
                                    // 15) LOGOUT
                                  console.log(testName + ' ... then I logout');
                                  authService.logout().then(() => { // 14
                                      // 16) LOGIN WITH THE CREDENTIALS OF  THE OWNER OF THE THING
                                    login(authService, theSharableThingOwnerEmail);
                                    userService.currentUser$.filter(userOwner => userOwner !== null).first().subscribe(userOwner => { // 15
                                      theUser = userOwner;
                                        // 17) GET THE SHARABLE THING CREATED BEFORE
                                      console.log(testName + ' THE SHARABLE KEY 111111111', theSharableThingKey1);
                                      const subS1 = sharableThingService.loadSharableThing(theSharableThingKey1).subscribe( // 16
                                        theThing1 => {
                                          console.log('THE THING1', theThing1);
                                            // 18) GET THE CALENDAR EVENTS AND CHECK THE THE USERS ARE CORRECT
                                          calendarBookViewcontrollerService.getCalendarEventsFromBook(theThing1.getCalendarBook())
                                          .do(events1 => console.log('EEEVVVEEENNNTTTSSS11111', events1))
                                          .subscribe( // 17
                                            events1 => {
                                              const numberOfBookings1 = events1.length;
                                              if (numberOfBookings1 !== 6) {
                                                  const errMessage1 = 'we expect to have one 6 events ';
                                                  console.log(testName + errMessage1, events1);
                                                  throw new Error(testName + errMessage1);
                                              }
                                              const errMessage = 'we expect to have the name of the friend as title of the event ';
                                              if (events1[0].title !== theFriendName1) {
                                                console.log(testName + errMessage, events1[0], theFriendName1);
                                                throw new Error(testName + errMessage);
                                              }
                                              if (events1[1].title !== theFriendName2 || events1[2].title !== theFriendName2) {
                                                console.log(testName + errMessage, events1[1], events1[2], theFriendName2);
                                                throw new Error(testName + errMessage);
                                              }
                                              if (events1[3].title !== theFriendName3
                                                  || events1[4].title !== theFriendName3
                                                  || events1[5].title !== theFriendName3) {
                                                console.log(testName + errMessage, events1[3], events1[4], events1[5], theFriendName3);
                                                throw new Error(testName + errMessage);
                                              }
                                              // sharableThingService.removeSharableThing()
                                                // 19) GET THE SHARABLE THING WITH NO BOOKINGS CREATED BEFORE
                                              console.log(testName + ' THE SHARABLE KEY 222222222', theSharableThingKey2);
                                              let events22;
                                              const subS2 = sharableThingService.loadSharableThing(theSharableThingKey2).subscribe( // 18
                                                theThing2 => {
                                                  console.log('THE THING2', theThing2);
                                                  // 20) GET THE CALENDAR EVENTS FOR THE THING WITH NO BOOKINGS AND CHECK THAT IT IS EMPTY
                                                  calendarBookViewcontrollerService.getCalendarEventsFromBook(theThing2.getCalendarBook())
                                                  .do(events2 => console.log('EEEVVVEEENNNTTTSSS2222222', events2))
                                                  .subscribe( // 19
                                                    events2 => {
                                                      events22 = events2;
                                                      const numberOfBookings2 = events2.length;
                                                      if (numberOfBookings2 !== 0) {
                                                          const errMessage2 = 'we expect to have one no events ';
                                                          console.log(testName + errMessage2, events2);
                                                          throw new Error(testName + errMessage2);
                                                      }
                                                      console.log(testName + 'PASSED');
                                                    },
                                                    errC2 => console.error('ERROR IN SUB CAL2', errC2),
                                                    () => {
                                                      console.log('SUB CAL2 COMPLETED');
                                                      subS2.unsubscribe();
                                                      if (!events22) {
                                                        const errMessage22 = 'we expect to have an empty array of events ';
                                                        console.log(testName + errMessage22, events22);
                                                        throw new Error(testName + errMessage22);
                                                      }
                                                      if (events22.length !== 0) {
                                                        const errMessage22 = 'we expect to have one no events ';
                                                        console.log(testName + errMessage22, events22);
                                                        throw new Error(testName + errMessage22);
                                                      }
                                                    }
                                                  ); // 19
                                                },
                                                errL2 => console.error('ERROR IN SUB LOAD2', errL2),
                                                () => {
                                                  console.log('SUB LOAD2 COMPLETED');
                                                }
                                              ); // 18
                                            },
                                            errC1 => console.error('ERROR IN SUB CAL1', errC1),
                                            () => {
                                              console.log('SUB CAL1 COMPLETED');
                                              subS1.unsubscribe();
                                            }
                                          ); // 17
                                        },
                                        errL1 => console.error('ERROR IN SUB LOAD1', errL1),
                                        () => console.log('SUB LOAD1 COMPLETED')
                                      ); // 16
                                    }); // 15
                                  }); // 14
                                }); // 13
                              }); // 12
                            }); // 11
                          }); // 10
                        }); // 09
                      }); // 08
                    }); // 07
                  }); // 06
                }); // 05
              }); // 04
            }); // 03
          }); // 02
        }); // 01.1
      }); // 01
    }); // 00
    done();
  });

});
