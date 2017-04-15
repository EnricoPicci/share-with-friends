import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-list',
  templateUrl: './sharable-thing-list.component.html',
  styleUrls: ['./sharable-thing-list.component.css']
})
export class SharableThingListComponent implements OnInit, OnDestroy {
  sharableThings: SharableThing[];

  sub1: Subscription;

  constructor(private sharableThingService: SharableThingService,
              private userService: UserService,
              private router: Router) { }

  ngOnInit() {
    this.sub1 = this.getActiveSharableThings().subscribe(sharableThings => this.sharableThings = sharableThings);
  }
  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

  getActiveSharableThings() {
    return this.userService.currentUser$
                .switchMap(user => this.sharableThingService.loadActiveSharableThingsForOwner(user))
                .do(things => console.log('the things', things));
  }

  goToSharableThing(sharableThing: SharableThing) {
    console.log('the thiiiiing', sharableThing);
    let key = '';
    if (sharableThing) {
      key = sharableThing.$key;
    }
    this.router.navigate(['sharableThing'], {queryParams: {sharableThingkey: key}});
    // this.router.navigate(['sharableThing'],
    //                               {skipLocationChange: true,
    //                               queryParams: {sharableThingkey: key}});
  }

  removeSharableThing(sharableThing: SharableThing) {
    this.sharableThingService.removeSharableThing(sharableThing);
  }

}
