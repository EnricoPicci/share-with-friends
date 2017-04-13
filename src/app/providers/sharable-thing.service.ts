import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFire, FirebaseListObservable, FirebaseApp } from 'angularfire2';
import * as firebase from 'firebase';
import {Subject, Observable} from 'rxjs/Rx';

import {environment} from '../../environments/environment';
import {firebaseConfig} from '../../environments/firebase.config';
import {SharableThing} from '../shared/model/sharable-thing';
import {User} from '../shared/model/user';
import {UserService} from './user.service';
import {MailSenderEmailjsService} from './mail-sender-emailjs.service';
import {Friend} from '../shared/model/friend';
import { BookingService } from './booking.service';

const SHARABLETHINGS = '/sharablethings/';

declare var Email: any;
// import * as smtpjs from 'smtp'

@Injectable()
export class SharableThingService {

  constructor(private af: AngularFire,
              @Inject(FirebaseApp) private firebaseApp: any,
              private bookingService: BookingService,
              private userService: UserService,
              private mailSenderService: MailSenderEmailjsService) {}

  loadSharableThingsForOwner(email: string) {
    return this.af.database.list(this.getFirebaseRef(), {
          query: {
            orderByChild: 'ownerEmail',
            equalTo: email
          }
        })
        // this filter is to avoid passing empty objects which may be present in the list, since
        // the 'getUniqueKeyForSharableThing()' method can actually create empty objects which are never
        // substituted by real sharableThings
        .map(items => items.filter(item => item.name))
        .map(SharableThing.fromJsonArray)
        .mergeMap(sharableThings => this.retrieveImageUrlsForAll(sharableThings));
  }
  loadActiveSharableThingsForOwner(email: string) {
    return this.loadSharableThingsForOwner(email)
                .map(sharableThings => sharableThings.filter(thing => !thing.removed));
  }
  loadSharableThing(key: string) {
    return this.af.database.object(this.getFirebaseObjRef(key))
            .map(SharableThing.fromJson)
            .map(sharableThing => {
              this.retrieveImageUrls(sharableThing);
              return sharableThing;
            })
            .switchMap(sharableThing => this.bookingService.loadBookingsForSharableThingKey(sharableThing.$key)
                                                        .map(bookings => {
                                                            return {sharableThing, bookings};
                                                          }))
            .map(({sharableThing, bookings}) => {
              sharableThing.getCalendarBook().bookings = bookings;
              return sharableThing;
            });
  }

  saveSharableThing(sharableThing: SharableThing) {
    // imageUrls need to be reset because they can not be saved in firebase given the format of the keys (which is the
    // format of the urls, containing '/' characters which can not be saved by Firebase as keys).
    // In any case imageUrls are built everytime the object is read from Firebase
    sharableThing.resetImageUrls();
    let ret: firebase.Thenable<any>;
    const listObservable =  this.af.database.list(this.getFirebaseRef());
    if (!sharableThing.$key) {
      ret = this.saveNewSharableThing(sharableThing, listObservable);
    } else {
      ret = this.updateSharableThing(sharableThing, listObservable);
    }
    return ret;
  }
  private saveNewSharableThing(sharableThing: SharableThing, listObservable: FirebaseListObservable<any>) {
    delete sharableThing.$key;
    const ret = listObservable.push(sharableThing)
              .then((item) => {
                sharableThing.$key = item.key;
                this.updateThingsOfferedToFriends(sharableThing);
              })
              .catch(err => console.error('error in saveSharableThing', err));
    return ret;
  }
  private updateSharableThing(sharableThing: SharableThing, listObservable: FirebaseListObservable<any>) {
    const theKey = sharableThing.$key;
    const theBookings = sharableThing.getCalendarBook().bookings;
    delete sharableThing.$key;
    // the bookings are removed from the CalendarBook before saving the sharableThing since the bookings
    // are saved in a different collection dedicated to Bookings. This means that each booking need to be
    // saved autonomously independent from the saving of the sharableThing
    delete sharableThing.getCalendarBook().bookings;
    const ret = listObservable.update(theKey, sharableThing)
              .then(() => {
                listObservable.remove(theKey + '/temporary');
                sharableThing.$key = theKey;
                // after saving the bookings are reset to their original value in the sharableThing
                sharableThing.getCalendarBook().bookings = theBookings;
                this.updateThingsOfferedToFriends(sharableThing);
              })
              .catch(err => console.log('err in saveSharableThing', err));
    return ret;
  }
  private updateThingsOfferedToFriends(sharableThing: SharableThing) {
    for (let i = 0; i < sharableThing.getFriendEmails().length; i++) {
      const friendEmail = sharableThing.getFriendEmails()[i];
      this.userService.addSharableThingOfferedToFriend(sharableThing.$key, friendEmail.email);
    }
  }
  getUniqueKeyForSharableThing(sharableThing: SharableThing) {
    if (sharableThing.$key) {
      console.log('sharable thing with a key', sharableThing);
      throw Error('The sharable thing has already a key');
    }
    const listObservable =  this.af.database.list(this.getFirebaseRef());
    // I push an object marked as temporary with a specific property to get a unique key.
    // The empy obj will be substituted by the real object when this is saved.
    // If the user does not save the sharableThing, then the list will contain empty objects.
    listObservable.push({temporary: true})
      .then((item) => {
        sharableThing.$key = item.key;
        console.log('getUniqueKeyForSharableThing', sharableThing);
      })
      .catch(err => console.error('error in getUniqueKeyForSharableThing', err));
  }

  sendMailToNotNotifiedFriends(currentUser: User, sharableThing: SharableThing) {
    const notNotifiedFriendEmails = sharableThing.getNotNotifiedEmails();
    for (let i = 0; i < notNotifiedFriendEmails.length; i++) {
      const friendEmail = notNotifiedFriendEmails[i];
      const friend = currentUser.getFriend(friendEmail.email);
      const link = environment.sharableThingShowcasePageUrl + sharableThing.$key + '&user=' + friendEmail.email;
      const message = sharableThing.createMessageForFriend(currentUser, friend, link);
      this.mailSenderService.sendMail(currentUser.email,
                                      friendEmail.email,
                                      message.subject,
                                      message.body);
      friendEmail.notified = true;
    }
    this.af.database.object(this.getFirebaseObjRef(sharableThing.$key) + '/friendEmails').update(sharableThing.getFriendEmails());
  }

  uploadImages(images: FileList, sharableThing: SharableThing) {
    const promises = [];
    if (images) {
      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        const path = this.getImageDirName(sharableThing) + '_' + imageFile.name;
        const storage = firebase.storage();
        const storageRef = storage.ref().child(path);
        promises.push(storageRef.put(imageFile)
                          .then(() => sharableThing.images.push(path))
                          .catch(err => console.error('error in uploadImages', err)));
      }
    }
    return Promise.all(promises);
  }
  retrieveImageUrls(sharableThing: SharableThing) {
    const promises = [];
    const imageFileNames = sharableThing.images;
    for (let i = 0; i < imageFileNames.length; i++) {
      const imageFileName = imageFileNames[i];
      const storage = firebase.storage();
      const storageRef = this.getStorageFileRef(imageFileName);
      promises.push(storageRef.getDownloadURL()
                        .then(fileUrl => sharableThing.addImageUrl(imageFileName, fileUrl))
                        .catch(err => console.error('error in downloading image url', err)));
    }
    return Promise.all(promises);
  }
  // retrieves the image urls for all the sharable things contained in the array of the input
  // returns an Observable which emits when all the promises have been resolved
  retrieveImageUrlsForAll(sharableThings: SharableThing[]) {
    const subject = new Subject<SharableThing[]>();
    const promises = [];
    for (let i = 0; i < sharableThings.length; i++) {
      const sharableThing = sharableThings[i];
      promises.push(this.retrieveImageUrls(sharableThing));
    }
    Promise.all(promises).then(res => {
                console.log('Promise any', res);
                subject.next(sharableThings);
                subject.complete();
            },
            err => {
                subject.error(err);
                subject.complete();
            });
    return subject.asObservable();
  }

  removeAllImagesFromStorage(sharableThing: SharableThing) {
    // THE FOLLOWING CODE WOULD REMOVE THE ENTIRE DIRECTORY
    // UNFORTUNATELY IT DOES NOT WORK SINCE FIREBASE SDK DOES NOT IMPLEMENT YET THE DELETE DIRECTORY FUNCTIONALITY
    // const imagesDir = this.getImageDirName(sharableThing);
    // console.log('imagesDir', imagesDir);
    // this.getStorageFileRef(imagesDir).delete()
    //         .catch(err => console.log('MANAGED DELETE FROM STORAGE EXCEPTION - no images found for', imagesDir));
    const imageFileNames = sharableThing.images;
    for (let i = 0; i < imageFileNames.length; i++) {
      const imageFileName = imageFileNames[i];
      const storageRef = this.getStorageFileRef(imageFileName);
      storageRef.delete();
    }
  }
  removeImage(sharableThing: SharableThing, imageUrl: string) {
    // const imageUrls = sharableThing.getImageUrls();
    // const imageFileName = _.findKey(imageUrls, imageUrl);
    const imageFileName = sharableThing.getImageFileNameForUrl(imageUrl);
    const imageFileNames = sharableThing.images;
    const imageFileNameIndex = imageFileNames.indexOf(imageFileName);
    sharableThing.images.splice(imageFileNameIndex, 1);
    // delete imageUrls[imageFileName];
    // this.af.database.object(this.getFirebaseObjRef(sharableThing.$key)).update(sharableThing)
    this.saveSharableThing(sharableThing);
      // .then(() => this.getStorageFileRef(imageFileName).delete());
  }
  private getStorageFileRef(fileName: string) {
    const storage = firebase.storage();
    return storage.ref().child(fileName);
  }

  removeSharableThing(sharableThing: SharableThing) {
    this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true, 'images': []})
        .then(() => this.removeAllImagesFromStorage(sharableThing));
    // this.af.database.list(this.getFirebaseRef()).update(sharableThing.$key, {'removed': true});
    const userEmails = this.getUserEmails(sharableThing.getFriendEmails());
    this.userService.removeSharableThingKeyFromUsers(userEmails, sharableThing.$key);
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
    const userEmails = this.getUserEmails(sharableThing.getFriendEmails());
    const removeFromFriendsObs = this.userService.removeSharableThingKeyFromUsersObs(userEmails, sharableThing.$key);
    return Observable.merge(removeObs, removeFromFriendsObs);
  }
  private getUserEmails(friendEmails: {email: string, notified: boolean}[]) {
    return friendEmails.map(friendEmail => friendEmail.email);
  }

  private getFirebaseRef() {
    return '/' + environment.db + SHARABLETHINGS;
  }
  private getFirebaseObjRef(key: string) {
    return this.getFirebaseRef() + '/' + key;
  }
  private getFirebaseSharableThingKey(sharableThing: SharableThing) {
    return this.getFirebaseRef() + sharableThing.$key;
  }
  private getImageDirName(sharableThing: SharableThing) {
    return 'images/' + sharableThing.ownerEmail.replace('@', '-') + '/' + sharableThing.$key + '/';
  }

}
