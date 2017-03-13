import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable } from 'angularfire2';
import * as firebase from 'firebase';
import {Subject, Observable} from 'rxjs/Rx';

import {environment} from '../../environments/environment';
import {firebaseConfig} from '../../environments/firebase.config';
import {SharableThing} from '../shared/model/sharable-thing';
import {User} from '../shared/model/user';
import {UserService} from './user.service';

const SHARABLETHINGS = '/sharablethings/';

@Injectable()
export class SharableThingService {

  constructor(private af: AngularFire, private userService: UserService) {}

  loadSharableThingsForOwner(user: User) {
    return this.af.database.list(this.getFirebaseRef(), {
      query: {
        orderByChild: 'ownerEmail',
        equalTo: user.email
      }
    }).map(SharableThing.fromJsonArray);
  }
  // allSharableThingKeysForOwner(user: User) {
  //   return this.http.get(firebaseConfig.databaseURL + '/' + environment.db + SHARABLETHINGS + '.json?shallow=true')
  //                   .map(response => response.json());
  // }
  loadSharableThing(key: string) {
    return this.af.database.object(this.getFirebaseRef() + '/' + key)
            .map(SharableThing.fromJson);
  }

  saveSharableThing(sharableThing: SharableThing) {
    let ret: firebase.Thenable<any>;
    const listObservable =  this.af.database.list(this.getFirebaseRef());
    if (!sharableThing.$key) {
      delete sharableThing.$key;
      ret = listObservable.push(sharableThing).then((item) => {
        sharableThing.$key = item.key;
        this.updateThingsOfferedToFriends(sharableThing);
      });
    } else {
      ret = listObservable.update(sharableThing.$key, sharableThing);
      this.updateThingsOfferedToFriends(sharableThing);
    }
    return ret;
  }
  private updateThingsOfferedToFriends(sharableThing: SharableThing) {
    for (let i = 0; i < sharableThing.friendEmails.length; i++) {
      const friendEmail = sharableThing.friendEmails[i];
      this.userService.addSharableThingOfferedToFriend(sharableThing.$key, friendEmail);
    }
  }

  removeSharableThing(sharableThing: SharableThing) {
    this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true});
    // this.af.database.list(this.getFirebaseRef()).remove(sharableThing.$key);
    this.userService.removeSharableThingKeyFromUsers(sharableThing.friendEmails, sharableThing.$key);
  }
  // implements the logic using the Observable pattern
  // requires client to subscribe in order for the logic to be activated
  removeSharableThingObs(sharableThing: SharableThing) {
    const subject = new Subject();
    // sharableThing.removed = true;
    this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true})
    // this.af.database.object(this.getFirebaseSharableThingKey(sharableThing)).update(sharableThing)
      .then(
          () => {
              subject.next(null);
              subject.complete();

          },
          err => {
              subject.error(err);
              subject.complete();
          }
      );
    const removeObs = subject.asObservable();
    const removeFromFriendsObs = this.userService.removeSharableThingKeyFromUsersObs(sharableThing.friendEmails, sharableThing.$key);
    return Observable.merge(removeObs, removeFromFriendsObs);
  }

  private getFirebaseRef() {
    return '/' + environment.db + SHARABLETHINGS;
  }
  private getFirebaseSharableThingKey(sharableThing: SharableThing) {
    return this.getFirebaseRef() + sharableThing.$key;
  }

}
