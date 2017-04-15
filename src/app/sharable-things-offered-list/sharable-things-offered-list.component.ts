import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingsOfferedListViewcontroller} from '../view-controllers/sharable-things-offered-list.viewcontroller';
import {SessionService} from '../providers/session.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-things-offered-list',
  templateUrl: './sharable-things-offered-list.component.html',
  styleUrls: ['./sharable-things-offered-list.component.css']
})
export class SharableThingsOfferedListComponent implements OnInit, OnDestroy {
  sharableThings: SharableThing[];

  sub1: Subscription;

  constructor(private router: Router,
              private viewController: SharableThingsOfferedListViewcontroller,
              private session: SessionService) { }

  ngOnInit() {
    this.sub1 = this.viewController
                      .getActiveSharableThings()
                      .subscribe(sharableThings => this.sharableThings = sharableThings);
  }
  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

  goToSharableThing(sharableThing: SharableThing) {
    console.log('the thiiiiing', sharableThing);
    this.session.sharableThingKey = sharableThing.$key;
    this.router.navigate(['sharableThingShowcase']);
  }

  bookSharableThing(sharableThing: SharableThing) {
    //
  }

}
