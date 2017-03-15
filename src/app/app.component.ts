import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';

import {UserService} from './providers/user.service';
import {AuthService} from './providers/auth.service';
import {User} from './shared/model/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  currentUser: User;

  // before leaving the app the logout is performed
  @HostListener('window:beforeunload', ['$event'])
    beforeUnloadHander(event) {
      this.logout();
  }

  constructor(private authService: AuthService, 
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(
      user => {console.log('current user', user); this.currentUser = user; }
    );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  ngOnDestroy() {
  }

}
