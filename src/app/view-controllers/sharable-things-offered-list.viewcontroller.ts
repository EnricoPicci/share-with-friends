import { Injectable } from '@angular/core';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';

@Injectable()
export class SharableThingsOfferedListViewcontroller {
  sharableThings: SharableThing[];

  constructor(private sharableThingService: SharableThingService,
              private userService: UserService) { }

  getActiveSharableThings() {
    return this.userService.currentUser$
                .switchMap(user => this.sharableThingService.loadActiveSharableThingsForFriend(user))
                .do(things => console.log('the things', things));
  }

}
