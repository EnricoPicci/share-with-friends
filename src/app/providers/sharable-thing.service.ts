import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable, FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import {Subject, Observable} from 'rxjs/Rx';

import {environment} from '../../environments/environment';
import {firebaseConfig} from '../../environments/firebase.config';
import {SharableThing} from '../shared/model/sharable-thing';
// import {User} from '../shared/model/user';
import {UserService} from './user.service';

const SHARABLETHINGS = '/sharablethings/';

declare var Email: any;
// import * as smtpjs from 'smtp'

@Injectable()
export class SharableThingService {

  constructor(private af: AngularFire, @Inject(FirebaseApp) private firebaseApp: any, private userService: UserService) {}

  loadSharableThingsForOwner(email: string) {
    return this.af.database.list(this.getFirebaseRef(), {
      query: {
        orderByChild: 'ownerEmail',
        equalTo: email
      }
    }).map(SharableThing.fromJsonArray);
  }
  loadActiveSharableThingsForOwner(email: string) {
    return this.loadSharableThingsForOwner(email)
                .map(sharableThings => sharableThings.filter(thing => !thing.removed));
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
    console.log('here I am');
    const sendResp = Email.send('from@you.com',
              'enrico.piccinin@gmail.com',
              'This is a subject',
              'this is the body',
              {token: '66722d6e-14ca-4ae3-b87c-77b3f54f750f'});
    console.log('send ret', sendResp);
    const listObservable =  this.af.database.list(this.getFirebaseRef());
    if (!sharableThing.$key) {
      delete sharableThing.$key;
      ret = listObservable.push(sharableThing)
              .then((item) => {
                sharableThing.$key = item.key;
                this.updateThingsOfferedToFriends(sharableThing);
              })
              .catch(err => console.error('error in saveSharableThing', err));
    } else {
      ret = listObservable.update(sharableThing.$key, sharableThing)
                .catch(err => console.log('err in saveSharableThing', err));
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
  // uploadImages(images: FileList, sharableThing: SharableThing) {
  //   for (let i = 0; i < images.length; i++) {
  //     const imageFile = images[i];
  //     const path = 'images/' + this.getImageDirName(sharableThing) + imageFile.name;
  //     const storageRef = this.firebaseApp.storage().ref().child(path);
  //     storageRef.put(imageFile).then((snapshot) => {
  //       sharableThing.images.push(imageFile.name);
  //       console.log('Uploaded a blob or file!', snapshot);
  //     });
  //   }
  // }
  uploadImages(images: FileList, sharableThing: SharableThing) {
    const promises = [];
    if (images) {
      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        // const path = 'images/' + this.getImageDirName(sharableThing) + imageFile.name.replace(/\s/g, '+');
        const path = 'images/' + this.getImageDirName(sharableThing) + '_' + imageFile.name;
        const storage = firebase.storage();
        const storageRef = storage.ref().child(path);
        promises.push(storageRef.put(imageFile)
                          .then(() => sharableThing.images.push(path))
                          .catch(err => console.error('error in uploadImages', err)));
      }
    }
    return Promise.all(promises);
  }

  removeSharableThing(sharableThing: SharableThing) {
    this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true});
    this.userService.removeSharableThingKeyFromUsers(sharableThing.friendEmails, sharableThing.$key);
  }
  // implements the logic using the Observable pattern
  // requires client to subscribe in order for the logic to be activated
  removeSharableThingObs(sharableThing: SharableThing) {
    const subject = new Subject();
    this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true})
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
  private getImageDirName(sharableThing: SharableThing) {
    return sharableThing.ownerEmail.replace('@', '-');
  }

}
