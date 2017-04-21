import { Injectable } from '@angular/core';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';

@Injectable()
export class SessionService {
  userMail: string;
  sharableThingKey: string;
  path: string;
  breakpoint: string;

  constructor(private media: ObservableMedia) {
    if (this.media.isActive('xs')) {
      this.breakpoint = 'xs';
    }
    this.media.asObservable().subscribe(change => this.breakpoint = change.mqAlias);
  }

  getDefaultNumberOfColumns() {
    let cols = 2;
    if (this.isSmartphone()) {
      cols = 1;
    };
    return cols;
  }

  isSmartphone() {
    return this.breakpoint === 'xs';
  }

}
