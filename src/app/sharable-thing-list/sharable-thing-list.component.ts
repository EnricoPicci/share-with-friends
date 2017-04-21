import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';
// import {MediaChange, ObservableMedia} from '@angular/flex-layout';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';
import {SessionService} from '../providers/session.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-list',
  templateUrl: './sharable-thing-list.component.html',
  styleUrls: ['./sharable-thing-list.component.css']
})
export class SharableThingListComponent implements OnInit, OnDestroy {
  sharableThings: SharableThing[];

  sub1: Subscription;
  // sub2: Subscription;
  // breakpoint: string;

  constructor(private sharableThingService: SharableThingService,
              private userService: UserService,
              private router: Router,
              private session: SessionService,
              // private media: ObservableMedia
              ) { }

  ngOnInit() {
    this.sub1 = this.getActiveSharableThings().subscribe(sharableThings => this.sharableThings = sharableThings);
    // if (this.media.isActive('xs')) {
    //   this.breakpoint = 'xs';
    // }
    // this.sub2 = this.media.asObservable().subscribe(change => {
    //               this.breakpoint = change.mqAlias;
    // });
  }
  ngOnDestroy() {
    this.sub1.unsubscribe();
    // this.sub2.unsubscribe();
  }

  // getNumberOfColumns() {
  //   let cols = 2;
  //   if (this.breakpoint === 'xs') {
  //     cols = 1;
  //   };
  //   return cols;
  // }

  getActiveSharableThings() {
    return this.userService.currentUser$
                .switchMap(user => this.sharableThingService.loadActiveSharableThingsForOwner(user))
                .do(things => console.log('the things', things));
  }

  goToSharableThing(sharableThing: SharableThing) {
    console.log('the thiiiiing', sharableThing);
    this.session.sharableThingKey = sharableThing ? sharableThing.$key : null;
    this.router.navigate(['sharableThing']);
  }

  removeSharableThing(sharableThing: SharableThing) {
    this.sharableThingService.removeSharableThing(sharableThing);
  }

}
