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
    // if there is a sharableThingKey in the session it means that the Login or Signup components have filled it
    // and therefore we are after the login
    if (this.session.sharableThingKey) {
      // check that the sharableThing is one which belongs to the list of things the current user has been granted
      this.sharableThingSubscription = this.sharableThingService.loadSharableThing(this.session.sharableThingKey).subscribe(
        sharableThing => {
          this.sharableThing = sharableThing;
          console.log('sharableThing to showcase', this.sharableThing);
        }
      );
    } else {  // there is no sharableThingKey in the session - it means that we have not yet logged in (either with Login or
              // Signup component)
      this.route.queryParams.subscribe(
        queryParams => {
          const userMail = queryParams['user'];
          const sharableThingKey = queryParams['sharableThingkey'];
          console.log('my initial params', queryParams);
          if (userMail && userMail !== '') {
            this.session.userMail = userMail;
            this.session.sharableThingKey = sharableThingKey;
            this.userService.getUser(userMail).subscribe(user => {
              console.log('user retrieved', user);
              if (user.hasUserAlreadySignedUp()) {
                this.router.navigate(['login'], {skipLocationChange: true});
              } else {
                this.router.navigate(['signup'], {skipLocationChange: true});
              }
            });
          } else {
            this.router.navigate(['login'], {skipLocationChange: true});
          }
        }
      );
    }
  }
  ngOnDestroy() {
    if (this.sharableThingSubscription) {
      this.sharableThingSubscription.unsubscribe();
    }
  }

}
