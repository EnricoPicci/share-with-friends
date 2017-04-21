import { Component, OnInit, OnDestroy } from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {MediaChange, ObservableMedia} from '@angular/flex-layout';

import {environment} from '../../environments/environment';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  images = ['share1.jpeg', 'share2.png', 'share3.png', 'share4.png'];
    tiles = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  sub: Subscription;
  breakpoint: string;

  constructor(private media: ObservableMedia) { }

  ngOnInit() {
    if (this.media.isActive('xs')) {
      this.breakpoint = 'xs';
    }
    this.sub = this.media.asObservable().subscribe(change => {
                  this.breakpoint = change.mqAlias;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  getImagePath(image: string) {
    return environment.imagePath + image;
  }

  getImageWidth() {
    let width = '';
    if (this.breakpoint === 'xs') {
      width = '150px';
    };
    return width;
  }

}
