import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';

import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { User } from '../shared/model/user';
import { SharableThing } from '../shared/model/sharable-thing';
import {Friend} from '../shared/model/friend';

import {createUserAndLogin, userEmail, userPwd, userName, sleep} from './test-common-functions';

describe('UserService', () => {
  let userService: UserService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, AuthService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([UserService, AuthService],
              (service1: UserService, service2: AuthService) => {
        userService = service1;
        authService = service2;
    })();
  });

  it('should login', done => {
    let counterOfChangesOfUserObservble = 0;
    let testSubscription;
    createUserAndLogin(authService);
    testSubscription = userService.currentUser$.subscribe(
        user => {
          switch (counterOfChangesOfUserObservble) {
            case 0:
              // nobody authenticated
              console.log('BBB +counter', counterOfChangesOfUserObservble, user);
              if (user) {throw new Error('user should be null'); };
              break;
            case 1:
              // after signup
              console.log('BBB counter', counterOfChangesOfUserObservble, user);
              // using expect() in this block caused an error - therefore revert to 'if then error' strategy
              // expect(user).toBeDefined();    FAILS
              if (user.email !== userEmail) {throw new Error('email for user ' + user.email + ' non right' + userEmail); };
              if (user.name !== userName) {throw new Error('name for user non right'); };
              testSubscription.unsubscribe();
              break;
          }
          counterOfChangesOfUserObservble++;
          done();
        },
        err => console.log,
        // The complete callback is never entered
        () => {console.log('user observable completed'); done(); }
      );
  });



  it('assumes someone will login (one previous test), wait few seconds and then add a friend to the user', done => {
    const friendNickname = 'my buddy';
    let theUser: User;
    let counterOfChangesOfUserObservble = 0;
    let testSubscription;
    testSubscription = userService.currentUser$.subscribe(
      user => {
          theUser = user;
          switch (counterOfChangesOfUserObservble) {
            case 0:
              // nobody authenticated
              console.log('DDD +counter', counterOfChangesOfUserObservble, user);
              if (user) {throw new Error('user should be null'); };
              break;
            case 1:
              // after signup
              console.log('DDD counter', counterOfChangesOfUserObservble, user);
              if (user.email !== userEmail) {throw new Error('email for user non right'); };
              if (user.name !== userName) {throw new Error('name for user non right'); };
              break;
            default:
              // check for friends
              if (user.getFriends().length > 0) {
                console.log('DDD+ counter', counterOfChangesOfUserObservble, user);
                testSubscription.unsubscribe();
                  if (user.getFriends()[0].nickName !== friendNickname) {
                  let errorString = 'the friend should have nicknmame ' + friendNickname;
                  errorString = errorString + ' but has this one instead ' + user.getFriends()[0].nickName;
                  throw new Error(errorString);
                }
              };
              break;
          }
          counterOfChangesOfUserObservble++;
          done();
        }
    );

    sleep(3000).then(() => {
      // add a friend
      console.log('after some time .... a friend is added');
      const friend1 = new Friend('first2', 'friend', friendNickname, 'my@buddy.com');
      theUser.getFriends().push(friend1);
      userService.saveUser(theUser).then(() => {
        console.log('... then I logout ...');
        authService.logout().then(() => {
          console.log('... then I wait some more time ...');
          sleep(1000).then(() => {
            console.log('... then I login again ...');
            authService.login(userEmail, userPwd).then(() => {
            });
            let secondTestSubscription;
            secondTestSubscription = userService.currentUser$.subscribe(
              user => {
                if (user) {
                  if (user.getFriends().length !== 1) {
                    console.log('the friends of this user are wrong', user.getFriends());
                    throw new Error('User should have 1 friend');
                  }
                  console.log('NUMBER OF FRIEND TEST PASSED');
                  secondTestSubscription.unsubscribe();
                  // clean the friends and save back the user
                  user.resetFriends();
                  userService.saveUser(user);
                }
              }
            );
          });
        });
      });
    });
  });



});
