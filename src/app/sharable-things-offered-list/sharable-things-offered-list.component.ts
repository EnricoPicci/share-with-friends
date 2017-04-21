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
  // sub2: Subscription;
  // breakpoint: string;

  constructor(private router: Router,
              private viewController: SharableThingsOfferedListViewcontrollerService,
              private session: SessionService,
              // private media: ObservableMedia
              ) { }

  ngOnInit() {
    this.sub1 = this.viewController
                      .getActiveSharableThings()
                      .subscribe(sharableThings => this.sharableThings = sharableThings);
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

  goToSharableThing(sharableThing: SharableThing) {
    console.log('the thiiiiing', sharableThing);
    this.session.sharableThingKey = sharableThing.$key;
    this.router.navigate(['sharableThingShowcase']);
  }

  bookSharableThing(sharableThing: SharableThing) {
    //
  }

}
