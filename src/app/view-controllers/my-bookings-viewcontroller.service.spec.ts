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

import { MyBookingsViewcontrollerService } from './my-bookings-viewcontroller.service';

describe('MyBookingsViewcontrollerService', () => {
  let myBookingsViewcontrollerService: MyBookingsViewcontrollerService;
  let bookingService: BookingService;
  let authService: AuthService;
  let userService: UserService;
  let sharableThingService: SharableThingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, UserService, MyBookingsViewcontrollerService,
                    BookingService, SharableThingService, MailSenderEmailjsService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([BookingService, AuthService, UserService, MyBookingsViewcontrollerService, SharableThingService],
                                                    (service1: BookingService,
                                                    service2: AuthService,
                                                    service3: UserService,
                                                    service4: MyBookingsViewcontrollerService,
                                                    service5: SharableThingService) => {
        bookingService = service1;
        authService = service2;
        userService = service3;
        myBookingsViewcontrollerService = service4;
        sharableThingService = service5;
    })();
  });

  it('should have services instanciated', done => {
    expect(bookingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(myBookingsViewcontrollerService).toBeTruthy();
    expect(sharableThingService).toBeTruthy();
    done();
  });


  // Test the following sequence
  // 1) LOGIN WITH THE CREDENTIALS OF THE FIRST OWNER OF A THING
  // 2) CREATE A NEW SHARABLE-THING AND SHARE IT WITH 1 FRIEND
  // 3) LOGOUT
  // 4) LOGIN WITH THE CREDENTIALS OF THE SECOND OWNER OF A SECOND THING
  // 5) CREATE A SECOND SHARABLE-THING WITH A DIFFERENT OWNER AND SHARE IT WITH THE SAME FRIEND
  // 6) LOGOUT
  // 7) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
  // 8) GET THE ACTIVE SHARABLE THINGS FOR THE FRIEND
  // 9) MAKE 2 BOOKINGS ON THE FIRST THING OFFERED
  // 10) MAKE 1 BOOKING ON THE SECOND THING OFFERED
  // 11) LOGOUT
  // 12) LOGIN WITH THE CREDENTIALS OF FRIEND
  // 13) GET THE BOOKINGS FOR THE FRIEND
    const testName = 'DDDDDDD - TEST THE BOOKINGS CREATED';
  it(testName, done => {
    const name = 'a thing to share with one friends';
    const description = 'a thing to be shared with one friend in the test ' + testName;
    const images = [];
    const monetaryAmountAmount = 30;
    const theFriendEmail = 'afriendforbookings@my.com';
    const theFriendName = 'afriendforbookings';
    let theUser: User;
    const theSharableThingOwnerEmail1 = 'owner-who-shares-for-bookings1@my.com';
    const theSharableThingOwnerEmail2 = 'owner-who-shares-for-bookings2@my.com';
    let theSharableThingKey1: string;
    let theSharableThingKey2: string;


        // 1) LOGIN WITH THE CREDENTIALS OF THE FIRST OWNER OF A THING
    createUserAndLogin(authService, theSharableThingOwnerEmail1);
    userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(30000).then(() => { // 00
        // 2) CREATE A NEW SHARABLE-THING AND SHARE IT WITH 1 FRIEND
      // create a sharable thing for 1 friend who will later book it
      console.log(testName + ' ... after some time create a sharable thing for 1 friend');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    theSharableThingOwnerEmail1,
                                    [
                                      {email: theFriendEmail, notified: false}
                                    ],
                                    false, {amount: monetaryAmountAmount});
      sharableThingService.saveSharableThing(sharableThing1).then(() => { // 01
        theSharableThingKey1 = sharableThing1.$key;
        console.log(testName + ' THE SHARABLE KEY', theSharableThingKey1);
        if (!sharableThing1.$key) {
            console.log(testName + ' ... we expect to have a key in the SharableThing', sharableThing1);
            throw new Error(testName + ' we expect to have a key in the SharableThing');
        }
          // 3) LOGOUT
        console.log(testName + ' ... then I logout');
        authService.logout().then(() => { // 02
          console.log(testName + ' ... then I wait some more time');
          sleep(1000).then(() => { // 03
                // 4) LOGIN WITH THE CREDENTIALS OF THE SECOND OWNER OF A SECOND THING
            console.log(testName + ' ... then I login again with the credentials of the second owner');
            createUserAndLogin(authService, theSharableThingOwnerEmail2);
            userService.currentUser$.filter(user1 => user1 !== null).first().subscribe(user1 => { // 04
                // 5) CREATE A SECOND SHARABLE-THING WITH A DIFFERENT OWNER AND SHARE IT WITH THE SAME FRIEND
              // create a second sharable thing for 1 friend who will later book it
              console.log(testName + ' ... after some time create a second sharable thing for 1 friend');
              const sharableThing2 = new SharableThing(null, name, description, [],
                                            theSharableThingOwnerEmail2,
                                            [
                                              {email: theFriendEmail, notified: false}
                                            ],
                                            false, {amount: monetaryAmountAmount});
              sharableThingService.saveSharableThing(sharableThing2).then(() => { // 05
                theSharableThingKey2 = sharableThing2.$key;
                  // 6) LOGOUT
                console.log(testName + ' ... then I logout');
                authService.logout().then(() => { // 06
                  console.log(testName + ' ... then I wait some more time');
                  sleep(1000).then(() => { // 07
                        // 7) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                    console.log(testName + ' ... then I login again with the credentials of the friend');
                    createUserAndLogin(authService, theFriendEmail, theFriendName);
                    userService.currentUser$.filter(user2 => user2 !== null).first().subscribe(user2 => { // 08
                      theUser = user2;
                          // 8) GET THE ACTIVE SHARABLE THINGS FOR ME, I.E. THE FRIEND
                      console.log(testName + ' ... get the active things offered to me ');
                      const sub1 = sharableThingService.loadActiveSharableThingsForFriend(theUser).subscribe(sharableThings => { // 09
                        sub1.unsubscribe();
                        let bkng;
                          // 9) MAKE 2 BOOKINGS ON THE FIRST THING OFFERED
                        const lastIndexOfThingsOfferedToMe1 = sharableThings.length - 2;
                        bkng = sharableThings[lastIndexOfThingsOfferedToMe1]
                                .addBooking(new Date(2017, 2, 2), new Date(2017, 2, 4), theUser.email);
                        bookingService.saveBooking(bkng);
                        bkng = sharableThings[lastIndexOfThingsOfferedToMe1]
                                .addBooking(new Date(2017, 5, 2), new Date(2017, 5, 4), theUser.email);
                        bookingService.saveBooking(bkng);
                          // 10) MAKE 1 BOOKING ON THE SECOND THING OFFERED
                        const lastIndexOfThingsOfferedToMe2 = sharableThings.length - 1;
                        bkng = sharableThings[lastIndexOfThingsOfferedToMe2]
                                .addBooking(new Date(2017, 7, 2), new Date(2017, 7, 4), theUser.email);
                        bookingService.saveBooking(bkng);
                          // 11) LOGOUT
                        console.log(testName + ' ... then I logout');
                        authService.logout().then(() => { // 10
                          console.log(testName + ' ... then I wait some more time');
                          sleep(1000).then(() => { // 11
                              // 12) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                            console.log(testName + ' ... then I login again with the credentials of the friend');
                            createUserAndLogin(authService, theFriendEmail, theFriendName);
                            userService.currentUser$.filter(user3 => user3 !== null).first().subscribe(user3 => { // 12
                              theUser = user2;
                                  // 13) GET THE BOOKINGS FOR ME, I.E. THE FRIEND
                              console.log(testName + ' ... get my bookings ');
                              const obsArray = new Array<Observable<any>>();
                              obsArray.push(myBookingsViewcontrollerService.getBookingsThingsOwnersForCurrentUser());
                              obsArray.push(sharableThingService.loadSharableThing(theSharableThingKey1));
                              obsArray.push(sharableThingService.loadSharableThing(theSharableThingKey2));
                              obsArray.push(userService.getUser(theSharableThingOwnerEmail1));
                              obsArray.push(userService.getUser(theSharableThingOwnerEmail2));
                              Observable.combineLatest(obsArray).first().subscribe(data => { // 13
                                const bookingsThingsUsers = data[0];
                                const thing1 = data[1];
                                const thing2 = data[2];
                                const owner1 = data[3];
                                const owner2 = data[4];
                                const numberOfBookings = bookingsThingsUsers.length;
                                if (numberOfBookings < 3) {
                                    const errMessage = 'we expect to have at leat 3 bookings ';
                                    console.log(testName + errMessage, bookingsThingsUsers);
                                    throw new Error(testName + errMessage);
                                }
                                const theBookingsAdded = bookingsThingsUsers.slice(-3);
                                const theBookingsOfOwner1 = theBookingsAdded
                                                              .filter(bkg => bkg.sharableThing.$key === theSharableThingKey1);
                                const theBookingOfOwner2 = theBookingsAdded
                                                              .filter(bkg => bkg.sharableThing.$key === theSharableThingKey2)[0];
                                const theBookingOfOwner11 = theBookingsOfOwner1[0];
                                const theBookingOfOwner12 = theBookingsOfOwner1[1];
                                if (theBookingOfOwner11.sharableThing.description !== thing1.description ||
                                    theBookingOfOwner12.sharableThing.description !== thing1.description ||
                                    theBookingOfOwner2.sharableThing.description !== thing2.description) {
                                      const errMessage = 'the sharableThing is not the expected one ';
                                      console.log(testName + errMessage, theBookingOfOwner11, theBookingOfOwner12, thing1, thing2);
                                      throw new Error(testName + errMessage);
                                }
                                if (theBookingOfOwner11.owner.name !== owner1.name ||
                                    theBookingOfOwner12.owner.name !== owner1.name ||
                                    theBookingOfOwner2.owner.name !== owner2.name) {
                                      const errMessage = 'the owner is not the expected one ';
                                      console.log(testName + errMessage, theBookingOfOwner11, theBookingOfOwner12, owner1, owner2);
                                      throw new Error(testName + errMessage);
                                }
                                console.log(testName + ' PASSED');
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
      }); // 01
    }); // 00
    done();
  });


});
