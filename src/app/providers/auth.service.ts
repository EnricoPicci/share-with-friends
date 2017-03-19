import { Injectable } from '@angular/core';
import {AngularFire, FirebaseAuthState, FirebaseObjectObservable, AngularFireAuth} from 'angularfire2';
import {Observable, Subject} from 'rxjs/Rx';
import 'rxjs/add/operator/map';

import {environment} from '../../environments/environment';
import {AuthInfo} from '../shared/model/auth-info';
import {User} from '../shared/model/user';

@Injectable()
export class AuthService {
  private authState: FirebaseAuthState;
  authInfo$: FirebaseObjectObservable<any>;
  authState$: AngularFireAuth;

  constructor(private af: AngularFire) {
    this.authState$ = this.af.auth;
    this.af.auth.map(auth => {
      const authInfo = new AuthInfo();
      if (auth) {
        authInfo.$uid = auth.uid;
        authInfo.authenticated = true;
      } else {
        authInfo.authenticated = false;
      }
      return authInfo;
    });
    this.af.auth.subscribe(val => this.authState = val);
  }

  signUp(email: string, password: string, name: string) {
    return this.af.auth.createUser({
                email: email,
                password: password
        }).then((auth) => {
          const profile = {displayName: name, photoURL: null};
          return auth.auth.updateProfile(profile);
        });
  }

  deleteUser() {
    if (this.authState) {
      this.authState.auth.delete();
    } else {
      console.log('There is no user logged so it is impossible to delete it');
    }
  };

  login(email: string, password: string) {
    return this.af.auth.login({email, password});
  }

  logout() {
      return this.af.auth.logout();
  }

  private fromFirebaseAuthPromise(promise): Observable<any> {
    const subject = new Subject<any>();
    promise
        .then(res => {
                subject.next(res);
                subject.complete();
            },
            err => {
                subject.error(err);
                subject.complete();
            });
    return subject.asObservable();
  }

}
