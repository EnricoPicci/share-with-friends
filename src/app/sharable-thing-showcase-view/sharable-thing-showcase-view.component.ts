import { Component, Input } from '@angular/core';

import {SessionService} from '../providers/session.service';

// import {SharableThing} from '../shared/model/sharable-thing';
// import {User} from '../shared/model/user';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'sharable-thing-showcase-view',
  template: `
              <swiper [config]="config" #usefulSwiper *ngIf="imageUrls" style="height: 300px; width: 400px;">
                  <div class="swiper-wrapper">
                      <img class="swiper-slide" *ngFor="let image of imageUrls" [src]="image">
                  </div>
                  <div class="swiper-pagination"></div>
                  <div class="swiper-button-next" style="right: 1px" *ngIf="!session.isSmartphone()"></div>
                  <div class="swiper-button-prev" style="left: 1px" *ngIf="!session.isSmartphone()"></div>
              </swiper>
            `,
  styleUrls: ['./sharable-thing-showcase-view.component.css']
})
export class SharableThingShowcaseViewComponent {
    @Input() imageUrls: Array<string>;

    config: Object = {
        pagination: '.swiper-pagination',
        paginationClickable: true,
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        spaceBetween: 30,
        slidesPerView: 1,
        autoplay: 2500,
        autoplayDisableOnInteraction: false
    };

  constructor(public session: SessionService
              ) { }
}
