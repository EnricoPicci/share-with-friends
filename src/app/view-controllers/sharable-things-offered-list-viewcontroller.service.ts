import { Injectable } from '@angular/core';

import {SharableThing} from '../shared/model/sharable-thing';
import {SharableThingService} from '../providers/sharable-thing.service';
import {UserService} from '../providers/user.service';

@Injectable()
export class SharableThingsOfferedListViewcontrollerService {
  sharableThings: SharableThing[];

  constructor(private sharableThingService: SharableThingService,
              private userService: UserService) { }

  getActiveSharableThings() {
    return this.userService.currentUser$
                .switchMap(user => this.sharableThingService.loadActiveSharableThingsForFriend(user))
                .do(things => console.log('the things', things));
  }

  getHeaderText(sharableThings: SharableThing[]) {
    let text = 'There are no things offered to you yet';
    if (sharableThings && sharableThings.length > 0) {
      if (sharableThings.length === 1) {
        text = 'You have 1 thing available';
      } else {
        text = 'You have ' + sharableThings.length + ' things available';
      }
    }
    return text;
  }

}
