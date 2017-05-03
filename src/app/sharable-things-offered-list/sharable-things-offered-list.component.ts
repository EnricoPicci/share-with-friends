import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';
// import {MediaChange, ObservableMedia} from '@angular/flex-layout';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingsOfferedListViewcontrollerService} from '../view-controllers/sharable-things-offered-list-viewcontroller.service';
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

  constructor(
    private router: Router,
    private viewController: SharableThingsOfferedListViewcontrollerService,
    private session: SessionService,
  ) { }

  ngOnInit() {
    this.sub1 = this.viewController
                      .getActiveSharableThings()
                      .subscribe(sharableThings => this.sharableThings = sharableThings);
  }
  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

  viewSharableThing(sharableThing: SharableThing) {
    this.session.showCalendarInShowcaseView = false;
    this.goToSharableThing(sharableThing);
  }
  bookSharableThing(sharableThing: SharableThing) {
    this.session.showCalendarInShowcaseView = true;
    this.goToSharableThing(sharableThing);
  }
  goToSharableThing(sharableThing: SharableThing) {
    this.session.sharableThingKey = sharableThing.$key;
    this.router.navigate(['sharableThingShowcase']);
  }

}
