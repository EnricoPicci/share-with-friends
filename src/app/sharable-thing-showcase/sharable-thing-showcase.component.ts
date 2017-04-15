import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs/Rx';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';
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
              private route: ActivatedRoute,
              private userService: UserService,
              private session: SessionService,
              private sharableThingService: SharableThingService
              ) { }

  ngOnInit() {
    // if there is a sharableThingKey in the session it means that I need to load a specific sharableThing
    if (this.session.sharableThingKey) {
      this.sharableThingSubscription = this.sharableThingService.loadSharableThing(this.session.sharableThingKey)
        .switchMap(sharableThing => this.userService.getUser(sharableThing.ownerEmail)
                                                      .map(owner => {return {sharableThing, owner}; }))
        .subscribe(({sharableThing, owner}) => {
          this.sharableThing = sharableThing;
          this.sharableThingService.retrieveImageUrls(sharableThing).then(() => {
            this.imageUrls = sharableThing.getImageUrls();
          });
          console.log('sharableThing to showcase', this.sharableThing);
          this.owner = owner;
          console.log('OWNER of sharableThing to showcase', this.owner);
        });
    }
  }
  ngOnDestroy() {
    if (this.sharableThingSubscription) {
      this.sharableThingSubscription.unsubscribe();
    }
  }

}
