import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../environments/firebase.config';

import { MaterialModule } from '@angular/material';
import 'hammerjs';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SwiperModule } from 'angular2-useful-swiper';
import { CalendarModule } from 'angular-calendar';

import {AuthService} from './providers/auth.service';
import {AuthGuard} from './providers/auth-guard.service';
import {UserService} from './providers/user.service';
import {SharableThingService} from './providers/sharable-thing.service';
import {MailSenderEmailjsService} from './providers/mail-sender-emailjs.service';
import {SessionService} from './providers/session.service';
import {BookingService} from './providers/booking.service';

import { AppComponent } from './app.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {SignupFormComponent} from './signup-form/signup-form.component';
import {LoginFormComponent} from './login-form/login-form.component';
import { HomeComponent } from './home/home.component';
import { SharableThingListComponent } from './sharable-thing-list/sharable-thing-list.component';
import { SharableThingComponent } from './sharable-thing/sharable-thing.component';
import {AddFriendEmailComponent} from './sharable-thing/add-friend-email-dialog.component';
import { FriendFormComponent } from './friend-form/friend-form.component';
import { SharableThingShowcaseComponent } from './sharable-thing-showcase/sharable-thing-showcase.component';
import { SharableThingsOfferedListComponent } from './sharable-things-offered-list/sharable-things-offered-list.component';

import {SharableThingsOfferedListViewcontrollerService} from './view-controllers/sharable-things-offered-list-viewcontroller.service';
// import { CalendarBookComponent } from './calendar-book/calendar-book.component';
import { SharableThingShowcaseViewComponent } from './sharable-thing-showcase-view/sharable-thing-showcase-view.component';
import { SharableThingShowcaseCalendarComponent } from './sharable-thing-showcase-calendar/sharable-thing-showcase-calendar.component';

const appRoutes: Routes = [
  { path: 'auth', component: HomeComponent,
      children: [
          {
            path: 'signup',
            component: SignupFormComponent
          },
          {
            path: 'login',
            component: LoginFormComponent
          },
          {
            path: '',
            component: LoginFormComponent
          }
        ]
    },
    { path: '',
      canActivate: [AuthGuard],
      children: [
          {
            path: 'sharableThingsList',
            component: SharableThingListComponent
          },
          {
            path: 'sharableThing',
            component: SharableThingComponent
          },
          {
            path: 'sharableThingShowcase',
            component: SharableThingShowcaseComponent
          },
          {
            path: 'shared-with-me',
            component: SharableThingsOfferedListComponent
          },
          // {
          //   path: 'calendar',
          //   component: CalendarBookComponent
          // },
          {
            path: '',
            redirectTo: '/auth',
            pathMatch: 'full'
          }
        ]
    },
    { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    SignupFormComponent,
    LoginFormComponent,
    HomeComponent,
    SharableThingListComponent,
    SharableThingComponent,
    AddFriendEmailComponent,
    FriendFormComponent,
    SharableThingShowcaseComponent,
    SharableThingsOfferedListComponent,
    // CalendarBookComponent,
    SharableThingShowcaseViewComponent,
    SharableThingShowcaseCalendarComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, authConfig),
    MaterialModule,
    RouterModule.forRoot(appRoutes),
    FlexLayoutModule,
    SwiperModule,
    CalendarModule.forRoot()
  ],
  providers: [AuthService,
              AuthGuard,
              UserService,
              SharableThingService,
              MailSenderEmailjsService,
              SessionService,
              BookingService,
              SharableThingsOfferedListViewcontrollerService],
  bootstrap: [AppComponent],
  entryComponents: [AddFriendEmailComponent]
})
export class AppModule { }
