import { TestBed, inject } from '@angular/core/testing';
import { AngularFireModule, FirebaseAuthState } from 'angularfire2';
import {firebaseConfig, authConfig} from '../../environments/firebase.config';
import {Observable} from 'rxjs/Rx';

import { AuthService } from './auth.service';
import { UserService } from './user.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, UserService],
      imports: [
        AngularFireModule.initializeApp(firebaseConfig, authConfig)
      ]
    });
    inject([AuthService], (service1: AuthService) => {
        authService = service1;
    })();
  });

  it('should signup a user and then delete the user created', done => {
    const email = 'buddy@my.com';
    const password = 'mypassw';
    const name = 'my name1';
    let subscription: any;
    authService.signUp(email, password, name).then(() => {
      console.log('signUp of user complete');
      subscription = authService.authState$.subscribe(authState => {
        if (authState) {
          expect(authState.auth.email).toEqual(email);
          expect(authState.auth.displayName).toEqual(name);
          console.log('unsubscribe2', subscription);
          if (subscription) {
            subscription.unsubscribe();
          }
          authService.deleteUser();
        }
        done();
      });
      console.log('unsubscribe1', subscription);
      if (subscription) {
        subscription.unsubscribe();
      }
    });
  });

it('should signup a user, then logoff and then login - user deleted at the end', done => {
    const email = 'buddy2login@my.com';
    const password = 'mypassw';
    const name = 'my name2';
    let subscription: any;
    authService.signUp(email, password, name).then(() => {
      authService.logout().then(() => {
        authService.login(email, password).then(() => {
          console.log('login of user complete');
          subscription =  authService.authState$.subscribe(authState => {
            if (authState) {
              expect(authState.auth.email).toEqual(email);
              expect(authState.auth.displayName).toEqual(name);
              expect(authState.auth.uid).toBeDefined();
              if (subscription) {
                subscription.unsubscribe();
              }
              authService.deleteUser();
            }
            done();
          });
          if (subscription) {
            subscription.unsubscribe();
          }
        });
      });
    });
  });

});
