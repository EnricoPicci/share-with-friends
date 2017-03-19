import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs/Rx';
import {MdDialog, MdDialogRef} from '@angular/material';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {User} from '../shared/model/user';
import {UserService} from '../providers/user.service';
import {AddFriendEmailComponent} from './add-friend-email-dialog.component';

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

  // sharableThing$: Observable<SharableThing>;
  sharableThing: SharableThing;
  currentUser: User;
  currentUserSubscription: Subscription;

  filesSelected: FileList;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private sharableThingService: SharableThingService,
              private userService: UserService,
              public dialog: MdDialog) {
    this.buildForm();
   }

  ngOnInit() {
    // this.route.queryParams
    //       .do(q => console.log('query params', q['sharableThingkey']))
    //       .switchMap(queryParams => this.sharableThingService.loadSharableThing(queryParams['sharableThingkey']))
    //       .subscribe(sharableThing => this.sharableThing = sharableThing);
    this.route.queryParams.subscribe(
      queryParams => {
        console.log('my params', queryParams);
        if (queryParams['sharableThingkey'] === '') {
          this.sharableThing = new SharableThing(null);
        } else {
          this.sharableThingService.loadSharableThing(queryParams['sharableThingkey']).subscribe(
            sharableThing => this.sharableThing = sharableThing
          );
        }
      }
    );
    this.currentUserSubscription = this.userService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }
  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
                    name: ['', Validators.required],
                    description: ['', Validators.required]
                  });
    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    console.log(this.form);
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
  }

  onSubmit(formData) {
    console.log('the thing', this.sharableThing);
    this.sharableThing.name = formData.name;
    this.sharableThing.description = formData.description;
    this.sharableThing.ownerEmail = this.currentUser.email;
    this.sharableThingService
          .uploadImages(this.filesSelected, this.sharableThing)
          .then(data => {
            console.log('after uploading', data);
            this.sharableThingService.saveSharableThing(this.sharableThing);
          })
          .catch(err => console.log(err));
  }

  addFriend() {
    const dialogRef = this.dialog.open(AddFriendEmailComponent);
    dialogRef.afterClosed().subscribe(email => {
      if (email) {
        this.sharableThing.friendEmails.push(email);
      }
    });
  }

  removeFriendEmail(friendMail) {
    const emailIndex = this.sharableThing.friendEmails.indexOf(friendMail);
    this.sharableThing.friendEmails.splice(emailIndex, 1);
  }

  error() {
    const d = null;
    d.length();
  }

}

