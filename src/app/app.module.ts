import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig, authConfig} from '../environments/firebase.config';

import { MaterialModule } from '@angular/material';
import 'hammerjs';

import {AuthService} from './providers/auth.service';
import {UserService} from './providers/user.service';
import {SharableThingService} from './providers/sharable-thing.service';

import { AppComponent } from './app.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {SignupFormComponent} from './signup-form/signup-form.component';
import {LoginFormComponent} from './login-form/login-form.component';
import { HomeComponent } from './home/home.component';
import { SharableThingListComponent } from './sharable-thing-list/sharable-thing-list.component';
import { SharableThingComponent } from './sharable-thing/sharable-thing.component';
import {AddFriendEmailComponent} from './sharable-thing/add-friend-email-dialog.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent,
      children: [
          {
            path: 'signup',
            component: SignupFormComponent
          },
          {
            path: '',
            component: LoginFormComponent
          }
        ]
    },
    {
      path: 'sharableThingsList',
      component: SharableThingListComponent
    },
    {
      path: 'sharableThing',
      component: SharableThingComponent
    },
    { path: '',
        redirectTo: '/login',
        pathMatch: 'full'
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
    AddFriendEmailComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig, authConfig),
    MaterialModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [AuthService, UserService, SharableThingService],
  bootstrap: [AppComponent],
  entryComponents: [AddFriendEmailComponent]
})
export class AppModule { }
