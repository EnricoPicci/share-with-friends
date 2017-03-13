import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import { SharableThingService } from './sharable-thing.service';
import { SharableThing } from '../shared/model/sharable-thing';
import { AuthService } from './auth.service';
import {UserService} from './user.service';
import { User } from '../shared/model/user';

import {createUserAndLogin, sleep, userEmail, userPwd} from './test-common-functions';

describe('SharableThingService', () => {
  let sharableThingService: SharableThingService;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharableThingService, AuthService, UserService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([SharableThingService, AuthService, UserService], (service1: SharableThingService,
                                                    service2: AuthService,
                                                    service3: UserService) => {
        sharableThingService = service1;
        authService = service2;
        userService = service3;
    })();
  });

  it('should have services instanciated', done => {
    expect(sharableThingService).toBeTruthy();
    expect(authService).toBeTruthy();
    expect(userService).toBeTruthy();
    done();
  });



  it('should save a sharable thing offered to some friends and then removes the sharable thing', done => {
    const name = 'a thing for friends';
    const description = 'a thing to share with some friends';
    const images = [];
    const monetaryAmountAmount = 100;
    const theSecondFriendEmail = 'asecondfriend@my.com';
    let testUserSubscription;
    let theUser: User;
    createUserAndLogin(authService);
    testUserSubscription = userService.currentUser$.filter(user => user !== null).first().subscribe(
        user => {
            theUser = user;
        }
    );
    sleep(3500).then(() => {
      // add a sharable thing for some friends
      console.log('after some time .... a sharable thing for for some friends is added');
      const sharableThing1 = new SharableThing(null, name, description, [],
                                    'fakeowner@my.com', [theUser.email, theSecondFriendEmail], false, monetaryAmountAmount);
      sharableThingService.saveSharableThing(sharableThing1).then(() => {
        console.log('... then I logout (ADD SHARABLE THING FOR SOME FRIENDs)...');
        authService.logout().then(() => {
          console.log('... then I wait some more time (ADD SHARABLE THING FOR SOME FRIENDs)...');
          sleep(1000).then(() => {
            console.log('... then I login again (ADD SHARABLE THING FOR SOME FRIENDs) ...');
            authService.login(userEmail, userPwd).then(() => {
                console.log('... and check if I find the thing that has been offered to me (ADD SHARABLE THING FOR SOME FRIENDs) ...');
                const obs1 = userService.getUser(theUser.email).first();
                const obs2 = userService.getUser(theSecondFriendEmail).first();
                const obs3 = sharableThingService.loadSharableThing(sharableThing1.$key).first();
                Observable.merge(obs1, obs2, obs3).subscribe(
                    userOrSharableThing => {
                        if (!(userOrSharableThing instanceof User ||
                                userOrSharableThing instanceof SharableThing)) {
                            console.log('we ex[ect only instance of type User or SharableThing', userOrSharableThing);
                            throw new Error('we ex[ect only instance of type User or SharableThing');
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
                                            console.log('we ex[ect only instance of type User or SharableThing', userOrSharableThing);
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
    done();
  });

});
