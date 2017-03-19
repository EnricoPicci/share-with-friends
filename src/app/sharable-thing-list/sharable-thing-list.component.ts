import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-list',
  templateUrl: './sharable-thing-list.component.html',
  styleUrls: ['./sharable-thing-list.component.css']
})
export class SharableThingListComponent implements OnInit {
  sharableThings: SharableThing[];

  constructor(private sharableThingService: SharableThingService,
              private userService: UserService,
              private router: Router) { }

  ngOnInit() {
    this.getActiveSharableThings().subscribe(sharableThings => this.sharableThings = sharableThings);
  }

  getActiveSharableThings() {
    return this.userService.currentUser$
                .switchMap(user => this.sharableThingService.loadActiveSharableThingsForOwner(user.email))
                .do(things => console.log('the things', things));
  }

  goToSharableThing(sharableThing: SharableThing) {
    console.log('the thiiiiing', sharableThing);
    let key = '';
    if (sharableThing) {
      key = sharableThing.$key;
    }
    this.router.navigate(['sharableThing'],
                                  {skipLocationChange: true,
                                  queryParams: {sharableThingkey: key}});
  }

}
