import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseAuthState } from 'angularfire2';
// import * as firebase from 'firebase';
import {Observable, Subject, ReplaySubject} from 'rxjs/Rx';

import {environment} from '../../environments/environment';
import {User} from '../shared/model/user';
import { AuthService } from './auth.service';

const USERS = '/users/';

@Injectable()
export class UserService {
  currentUser$: Observable<User>;

  constructor(private af: AngularFire,
              private authService: AuthService) {
    this.currentUser$ = this.authService.authState$
                                .switchMap(authState => this.getCurrentUser(authState));
  }

  private createUser(uid: string, name: string, email: string) {
    const dbKey = this.getDbKey(email);
    const user = new User(uid, name, email, dbKey);
    return user;
  }

  saveUser(user: User) {
    const dbKey = this.getFirebaseUserKey(user);
    user.dbKey = dbKey;
    return this.af.database.object(dbKey).update(user);
  }

  private getCurrentUser(authState: FirebaseAuthState) {
    let ret: Observable<User>;
    if (!authState) {
      const subject = new ReplaySubject<User>(1);
      subject.next(null);
      subject.complete();
      ret = subject.asObservable();
    } else {
      const userDbKey = this.getDbKey(authState.auth.email);
      const createUserIfNeededSubscription = this.af.database.object(this.getFirebaseRef() + userDbKey)
                                                              .map(User.fromJson).subscribe(
        user => {
          if (!this.hasUserAlreadySignedUp(user)) {
            user.authUid = authState.uid;
            user.name = authState.auth.displayName;
            user.email = authState.auth.email;
            this.saveUser(user);
            createUserIfNeededSubscription.unsubscribe();
          }
        }
      );
      ret = this.af.database.object(this.getFirebaseRef() + userDbKey)
                .map(jsonObj => {
                  return User.fromJson(jsonObj);
                });
    }
    return ret;
  }
  private hasUserAlreadySignedUp(user: User) {
      return user.hasUserAlreadySignedUp();
  }

  getUser(userEmail: string) {
    return this.af.database.object(this.getFirebaseUserKeyFromEmail(userEmail))
                .map(User.fromJson);
  }

  removeUser(user: User) {
    const dbKey = this.getFirebaseUserKey(user);
    this.af.database.object(dbKey).remove();
  }
  removeAuthenticatedUser() {
    this.currentUser$.subscribe(
      user => {this.removeUser(user); console.log('removeAuthenticatedUser val', user); },
      err => console.log('removeAuthenticatedUser error'),
      () => console.log('removeAuthenticatedUser complete')
    );
  }

  addSharableThingOfferedToFriend(sharableThingKey: string, friendEmail: string) {
    const friendDbKey = this.getDbKey(friendEmail);
    const firebaseUserObj = this.af.database.object(this.getFirebaseRef() + friendDbKey);
    firebaseUserObj.map(User.fromJson).first().subscribe(
        user => {
          let thisUser = user;
          if (!user.email) {
            thisUser = this.createUser(null, null, friendEmail);
          }
          if (thisUser.thingsOfferedToMeKeys.indexOf(sharableThingKey) < 0) {
            thisUser.thingsOfferedToMeKeys.push(sharableThingKey);
            this.saveUser(thisUser);
          }
        }
      );
  }
  removeSharableThingKeyFromUsers(userEmails: Array<string>, sharableThingKey: string) {
    for (let i = 0; i < userEmails.length; i++) {
      const userMail = userEmails[i];
      this.getUser(userMail).first().subscribe(
        user => {
          const thingIndex = user.thingsOfferedToMeKeys.indexOf(sharableThingKey);
          if (thingIndex > -1) {
            user.thingsOfferedToMeKeys.splice(thingIndex, 1);
            this.saveUser(user);
          }
        }
      );
    }
  }
  // implements the logic using the Observable pattern
  // requires client to subscribe in order for the logic to be activated
  removeSharableThingKeyFromUsersObs(userEmails: Array<string>, sharableThingKey: string) {
    return Observable.from(userEmails)
              // it is important to have the 'first()' operator after 'getUser()' since we are going to save the user
              // via saveUser method - the save of the user generates a variation in the user which causes the Observable
              // returned by getUser() method to emit again - without the first() operator the function of the map
              // operator below is entered 2 times and the Observable return by this method is never completed
              .flatMap(email => this.getUser(email).first())
              .map(
                user => {
                  const thingIndex = user.thingsOfferedToMeKeys.indexOf(sharableThingKey);
                  if (thingIndex > -1) {
                    user.thingsOfferedToMeKeys.splice(thingIndex, 1);
                    this.saveUser(user);
                  }
                  return user;
                });
  }

  private getDbKey(email: string) {
    return email.replace(/\./g, '-dot-').replace('@', '-at-');
  }
  private getFirebaseUserKey(user: User) {
    return this.getFirebaseUserKeyFromEmail(user.email);
  }
  private getFirebaseUserKeyFromEmail(userEmail: string) {
    return this.getFirebaseRef() + this.getDbKey(userEmail);
  }
  private getFirebaseRef() {
    return '/' + environment.db + USERS;
  }

}
