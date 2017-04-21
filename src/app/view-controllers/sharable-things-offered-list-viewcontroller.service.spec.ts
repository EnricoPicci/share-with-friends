import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import {SharableThingsOfferedListViewcontrollerService} from './sharable-things-offered-list-viewcontroller.service';
import { SharableThingService } from '../providers/sharable-thing.service';
import { SharableThing } from '../shared/model/sharable-thing';
import { AuthService } from '../providers/auth.service';
import {UserService} from '../providers/user.service';
import { User } from '../shared/model/user';
import {MailSenderEmailjsService} from '../providers/mail-sender-emailjs.service';
import { BookingService } from '../providers/booking.service';

import {createUserAndLogin, sleep, userEmail, userPwd} from '../providers/test-common-functions';

describe('SharableThingsOfferedListViewcontrollerService', () => {
  let sharableThingsOfferedListViewcontrollerService: SharableThingsOfferedListViewcontrollerService;
  let sharableThingService: SharableThingService;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharableThingService, AuthService, UserService, SharableThingsOfferedListViewcontrollerService,
                    BookingService, MailSenderEmailjsService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([SharableThingService, AuthService, UserService, SharableThingsOfferedListViewcontrollerService],
                                                    (service1: SharableThingService,
                                                    service2: AuthService,
                                                    service3: UserService,
                                                    service4: SharableThingsOfferedListViewcontrollerService) => {
        sharableThingService = service1;
        authService = service2;
        userService = service3;
        sharableThingsOfferedListViewcontrollerService = service4;
    })();
  });

  it('should have services instanciated', done => {
    expect(sharableThingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    expect(sharableThingsOfferedListViewcontrollerService).toBeTruthy();
    done();
  });




  // Test the following sequence
  // 1) LOGIN
  // 2) CREATE A NEW SHARABLE-THING AND SHARE IT WITH A FRIEND
  // 3) LOGOUT
  // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
  // 5) GET THE ACTIVE SHARABLE THINGS FOR ME
  // 6) REMOVE THE SHARABLE THING
    const testName = 'BBBBBB - TEST THE ACTIVE SHARABLE THINGS AND THEIR OWNER';
  it(testName, done => {
    const name = 'a thing to share';
    const description = 'a thing to be shared in the test ' + testName;
    const images = [];
    const monetaryAmountAmount = 60;
    const theFriendEmail = 'afriend@my.com';
    let theUser: User;
    const theSharableThingOwnerEmail = 'owner-who-shares@my.com';

    createUserAndLogin(authService, theSharableThingOwnerEmail);
    userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(15000).then(() => { // 00
        // 1) LOGIN
        // createUserAndLogin(authService, theSharableThingOwnerEmail);
        // userService.currentUser$.filter(user => user !== null).first().subscribe(
        //     user => {
        //         theUser = user;
        //     }
        // );
        // createUserAndLogin(authService, theSharableThingOwnerEmail);
        // 2) CREATE A NEW SHARABLE-THING
      // create a sharable thing for a friend who will later book it
      console.log(testName + ' ... after some time a sharable thing for a friend');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    theSharableThingOwnerEmail, [{email: theFriendEmail, notified: false}],
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
            sleep(1000).then(() => { // 03
                    // 4) LOGIN AGAIN WITH THE CREDENTIALS OF THE FRIEND
                console.log(testName + ' ... then I login again with the credentials of the friend');
                createUserAndLogin(authService, theFriendEmail);
                userService.currentUser$.filter(user => user !== null).first().subscribe(user => { // 04
                    theUser = user;
                        // 5) GET THE ACTIVE SHARABLE THINGS FOR ME, I.E. THE FRIEND
                    console.log(testName + ' ... get the active things offered to me ');
                    const sub = sharableThingsOfferedListViewcontrollerService.getActiveSharableThings().subscribe(sharableThings => {
                        const numberOfThingsOfferedToMe = sharableThings.length;
                        if (numberOfThingsOfferedToMe !== 1) {
                            const errMessage = 'we expect to have one SharableThing offered to the user ';
                            console.log(testName + errMessage, theUser, sharableThings);
                            throw new Error(testName + errMessage);
                        }
                        if (sharableThings[0].description !== description) {
                            const errMessage = 'we expect to have the SharableThing which was added at the beginning ';
                            console.log(testName + errMessage, theUser, sharableThings);
                            throw new Error(testName + errMessage);
                        }
                        sub.unsubscribe();
                        // 6) REMOVE THE SHARABLE THING
                        userService.removeSharableThingKeyFromUsers([theUser.email], sharableThings[0].$key);
                        sharableThingService.removeSharableThing(sharableThings[0]);
                        // userService.removeAuthenticatedUser();
                        console.log(testName + 'PASSED');
                    });
                }); // 04
            }); // 03
        }); // 02
      }); // 01
    }); // 00
    done();
  });

});
