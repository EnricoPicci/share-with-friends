import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {User} from '../shared/model/user';
import {SessionService} from '../providers/session.service';
import {UserService} from '../providers/user.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-showcase',
  templateUrl: './sharable-thing-showcase.component.html',
  styleUrls: ['./sharable-thing-showcase.component.css']
})
export class SharableThingShowcaseComponent implements OnInit, OnDestroy {
  sharableThing: SharableThing;
  sharableThingSubscription: Subscription;
  currentUserSub: Subscription;

  imageUrls: Array<string>;
  owner: User;
  currentUser: User;

  showCalendar: boolean;

  constructor(
              private router: Router,
              private session: SessionService,
              private sharableThingService: SharableThingService,
              private userService: UserService
              ) { }

  ngOnInit() {
    this.currentUserSub = this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    // if there is a sharableThingKey in the session it means that I need to load a specific sharableThing
    if (this.session.sharableThingKey) {
      this.showCalendar = this.session.showCalendarInShowcaseView;
      this.sharableThingSubscription = this.sharableThingService.loadSharableThingAndOwner(this.session.sharableThingKey)
        .subscribe(({sharableThing, owner}) => {
          // the change detection mechanism works because any time a booking is added or removed a sharableThing
          // instance is created and passed into this callback --- SharableThingService.loadSharableThing
          // we pass 'sharableThing' to the input property of the SharableThingShowcaseCalendarComponent component
          // if we add ad a booking to the 'sharableThing' and we keep the same instance of sharableThing,
          // then the new booking is not shown in the calendar unless the view is refreshed
          // An altrnative would be to use the following line of code
          /* this.sharableThing = Object.assign(new SharableThing(null, null, null), sharableThing); */
          this.sharableThing = sharableThing;
          this.sharableThingService.retrieveImageUrls(sharableThing).then(() => {
            this.imageUrls = sharableThing.getImageUrls();
          });
          this.owner = owner;
        });
    } else {
      this.router.navigate(['shared-with-me']);
    }
  }
  ngOnDestroy() {
    console.log('Destroy the SHOWCASE view');
    if (this.sharableThingSubscription) {
      this.sharableThingSubscription.unsubscribe();
    }
    this.currentUserSub.unsubscribe();
  }

  toggleView() {
    this.showCalendar = !this.showCalendar;
  }
  getViewButtonText() {
    let text = 'Book';
    if (this.showCalendar) {
      text = 'View Details';
    }
    return text;
  }

}
