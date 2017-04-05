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
      this.authService.logout();
  }

  constructor(private authService: AuthService,
              private userService: UserService,
              private router: Router) {
  }

  ngOnInit() {
    this.userService.currentUser$.subscribe(
      user => {
        console.log('current user', user);
        this.currentUser = user;
      }
    );
    // this.route.queryParams.subscribe(
    //   queryParams => {
    //     const userMail = queryParams['user'];
    //     const sharableThingKey = queryParams['sharableThingkey'];
    //     console.log('my initial params', queryParams);
    //     if (userMail && userMail !== '') {
    //       this.userService.getUser(userMail).subscribe(user => {
    //         console.log('user retrieved', user);
    //         if (!user.hasUserAlreadySignedUp()) {
    //           this.router.navigate(['signup'], {skipLocationChange: true});
    //         } else {
    //           this.router.navigate(['login'], {skipLocationChange: true});
    //         }
    //       });
    //     } else {
    //       // this.router.navigate(['login'], {skipLocationChange: true});
    //     }
    //   }
    // );
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['']);
  }

  ngOnDestroy() {
  }

}
