import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {MdDialog, MdDialogRef} from '@angular/material';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {User} from '../shared/model/user';
import {UserService} from '../providers/user.service';
import {SessionService} from '../providers/session.service';
import {AddFriendEmailDialogComponent} from './add-friend-email-dialog.component';
import {Friend} from '../shared/model/friend';
import {SharableThingShowcaseCalendarComponent} from '../sharable-thing-showcase-calendar/sharable-thing-showcase-calendar.component';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing',
  templateUrl: './sharable-thing.component.html',
  styleUrls: ['./sharable-thing.component.css']
})
export class SharableThingComponent implements OnInit, OnDestroy {
  formErrors = {
    'name': '',
    'description': '',
    'imagefile': ''
  };
  validationMessages = {
    'name': {
      'required': 'Name is required.'
    },
    'description': {
      'required': 'Description is required.'
    },
    'imagefile': {
      'required': 'Image file is required.'
    }
  };
  errorMessage: string;
  form: FormGroup;

  sharableThing: SharableThing;
  currentUser: User;
  currentUserSub: Subscription;
  sharableThingSub: Subscription;

  filesSelected: FileList;

  @ViewChild(SharableThingShowcaseCalendarComponent) calendarComponent: SharableThingShowcaseCalendarComponent;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private sharableThingService: SharableThingService,
              private userService: UserService,
              private session: SessionService,
              public dialog: MdDialog) {
    this.buildForm();
   }

  ngOnInit() {
    // Make sure that we first get the currentUser and then create (or load) the sharableThing
    // This is important in the case of a new SharableThing - when we create a new SharableThing we want to make sure
    // we have already the currentUser at hand, as well as in the case of an existing thing since we need to retrieve
    // the friend nickName from the currentUser
    this.currentUserSub = this.userService.currentUser$.subscribe(user => {
      // loading or creating a sharableThing must happen only once, i.e. when the there is no sharableThing
      // if the sharableThing property has been already filled, then there is no point in subscribing again to load it
      // or, even worse, creating a new one
      if (!this.sharableThing) {
        this.currentUser = user;
        if (this.session.sharableThingKey) {
        this.sharableThingSub = this.sharableThingService.loadSharableThing(this.session.sharableThingKey).subscribe(sharableThing => {
          this.sharableThingService.retrieveImageUrls(sharableThing)
                .then(() => {
                  this.sharableThing = sharableThing;
                  this.form.controls['name'].setValue(sharableThing.name);
                  this.form.controls['description'].setValue(sharableThing.description);
                  this.form.controls['price'].setValue(sharableThing.monetaryAmount.amount);
                  // this.form.controls['blockweekends'].setValue(sharableThing.getCalendarBook().blockWeekends);
                  // this.form.controls['blockworkweek'].setValue(sharableThing.getCalendarBook().blockWorkweek);
                  for (const day of this.getBlockableDays()) {
                    this.form.controls[day.name].setValue(sharableThing.getCalendarBook()[day.blockProperty]);
                  }
                });
          });
        } else {
          this.sharableThing = new SharableThing(null, null, null);
          this.sharableThing.ownerEmail = this.currentUser.email;
          this.sharableThingService.getUniqueKeyForSharableThing(this.sharableThing);
        }
      }
    });
  }
  ngOnDestroy() {
    this.currentUserSub.unsubscribe();
    if (this.sharableThingSub) {
      this.sharableThingSub.unsubscribe();
    }
    // if the sharableThing does not have a name, then it means that it has not been saved
    // in this case there is a record on the db holding just the $key of the sharableThing
    // and this record needs to be deleted
    if (!this.sharableThing.name) {
      this.sharableThingService.deleteSharableThing(this.sharableThing);
    }
  }

  buildForm(): void {
    const group = {
                    name: ['', Validators.required],
                    description: ['', Validators.required],
                    price: [null],
                    // blockweekends: [''],
                    // blockworkweek: ['']
                  };
    for (const day of this.getBlockableDaysLabels()) {
      group[day] = [false];
    }
    this.form = this.formBuilder.group(group);
    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }
    const form = this.form;
    // tslint:disable-next-line:forin
    this.errorMessage = null;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  fileChangeEvent($event) {
    console.log('file selected', $event);
    console.log('the files', $event.target.files);
    this.filesSelected = $event.target.files;
    this.sharableThingService.uploadImages(this.filesSelected, this.sharableThing)
            .then(() => this.sharableThingService.retrieveImageUrls(this.sharableThing));
  }

  onSubmit(formData) {
    this.sharableThing.name = formData.name;
    this.sharableThing.description = formData.description;
    this.sharableThing.monetaryAmount.amount = formData.price;
    // this.sharableThing.getCalendarBook().blockWeekends = formData.blockweekends;
    // this.sharableThing.getCalendarBook().blockWorkweek = formData.blockworkweek;
    this.updateCalendarBook(formData);
    this.sharableThingService.saveSharableThing(this.sharableThing)
          .then(() => {
            this.sharableThingService.sendMailToNotNotifiedFriends(this.currentUser, this.sharableThing);
            // the user is saved here to save the friends we may have added
            this.userService.saveUser(this.currentUser)
                            .then(() => this.router.navigate(['sharableThingsList']))
                            // .then(() => this.router.navigate(['sharableThingsList'], {skipLocationChange: true}))
                            .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
  }

  updateCalendarBook(formData) {
    for (const day of this.getBlockableDays()) {
      this.sharableThing.getCalendarBook()[day.blockProperty] = formData[day.name];
    }
  }

  addFriend() {
    const dialogRef = this.dialog.open(AddFriendEmailDialogComponent);
    dialogRef.afterClosed().subscribe((friend: Friend) => {
      if (friend && friend.email) {
        this.sharableThing.addFriendEmail(friend.email, false);
        this.currentUser.addFriend(friend);
      }
    });
  }

  removeFriendEmail(friendMail) {
    this.sharableThing.removeFriendEmail(friendMail);
  }

  removeImage(imageUrl) {
    this.sharableThingService.removeImage(this.sharableThing, imageUrl);
  }

  getFriendNickname(friendEmail: string) {
    const friend = this.currentUser.getFriend(friendEmail);
    return friend.nickName;
  }

  getColSpanForImages() {
    return this.session.breakpoint === 'xs' ? 4 : 2;
  }
  getColSpanForFriends() {
    return this.session.breakpoint === 'xs' ? 2 : 1;
  }

  getBlockableDaysLabels() {
    return this.getBlockableDays().map(day => day.name);
  }
  getBlockableDays() {
    return [
      {name: 'Sun', blockProperty: 'blockSunday', longName: 'Sunday'},
      {name: 'Mon', blockProperty: 'blockMonday', longName: 'Monday'},
      {name: 'Tue', blockProperty: 'blockTuesday', longName: 'Tuesday'},
      {name: 'Wed', blockProperty: 'blockWednesday', longName: 'Wednesday'},
      {name: 'Thu', blockProperty: 'blockThursday', longName: 'Thursday'},
      {name: 'Fri', blockProperty: 'blockFriday', longName: 'Friday'},
      {name: 'Sat', blockProperty: 'blockSaturday', longName: 'Saturday'},
    ];
  }
  getDayName(day) {
    return day;
  }
  getDayCheckboxTooltip(dayShortName) {
    const longDayName = this.getBlockableDays().filter(day => day.name === dayShortName)[0].longName;
    return 'Check if you want to block all ' + longDayName + 's';
  }
  toggleBlock(dayShortName, event) {
    const dayBlockProperty = this.getBlockableDays().filter(day => day.name === dayShortName)[0].blockProperty;
    this.sharableThing.getCalendarBook()[dayBlockProperty] = event.checked;
    this.calendarComponent.refreshView();
  }
}

