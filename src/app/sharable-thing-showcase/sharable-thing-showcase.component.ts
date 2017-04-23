import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {User} from '../shared/model/user';
import {SessionService} from '../providers/session.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-showcase',
  templateUrl: './sharable-thing-showcase.component.html',
  styleUrls: ['./sharable-thing-showcase.component.css']
})
export class SharableThingShowcaseComponent implements OnInit, OnDestroy {
  sharableThing: SharableThing;
  sharableThingSubscription: Subscription;

  imageUrls: Array<string>;
  owner: User;

  showCalendar = false;

  config: Object = {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        spaceBetween: 30,
        slidesPerView: 1,
        loop: true
    };

  constructor(
              private router: Router,
              private session: SessionService,
              private sharableThingService: SharableThingService
              ) { }

  ngOnInit() {
    // if there is a sharableThingKey in the session it means that I need to load a specific sharableThing
    if (this.session.sharableThingKey) {
      this.sharableThingSubscription = this.sharableThingService.loadSharableThingAndOwner(this.session.sharableThingKey)
        .subscribe(({sharableThing, owner}) => {
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
