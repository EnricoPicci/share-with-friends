import { Component, OnInit, OnDestroy } from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {Subscription} from 'rxjs/Rx';

import {Friend} from '../shared/model/friend';
import {UserService} from '../providers/user.service';
import {User} from '../shared/model/user';

@Component({
  template: `
                    <h3 md-dialog-title>add a friend</h3>
                    <section style="display: flex; align-content: center; align-items: center; height: 80px;">
                        <!--  Use hidden rather than *ngIf since I need to use the template variable #emailInput outside
                                the structural directive *ngIf -->
                        <md-input-container class="inputField" [style.display]="newFriend ? 'block' : 'none'">
                            <input mdInput placeholder="Email" #emailInput type="email">
                            <md-hint *ngIf="errorMessageEmail" 
                                [ngStyle]="{'color': 'red'}" align="start">{{errorMessageEmail}}</md-hint> 
                        </md-input-container>
                        <md-select placeholder="Friend from list" *ngIf="!newFriend"  class="inputField" (change)="setFriend($event)">
                            <md-option *ngFor="let friend of currentUser.getFriends()" [value]="friend.email">
                                    {{ friend.email }}
                            </md-option>
                        </md-select>
                        <md-slide-toggle (change)="toggleNewFriend()">
                            {{toggleButtonText()}}
                        </md-slide-toggle>
                    </section>
                    <section style="display: flex; align-content: center; align-items: center; height: 80px;">
                        <md-input-container class="inputField">
                            <input mdInput placeholder="Nickname" [value]="selectedFriend?.nickName" 
                                [disabled]="!newFriend" #nicknameInput>
                            <md-hint *ngIf="errorMessageNickname" 
                                [ngStyle]="{'color': 'red'}" align="start">{{errorMessageNickname}}</md-hint> 
                        </md-input-container>
                        <md-input-container class="inputField">
                            <input mdInput placeholder="First Name" [value]="selectedFriend?.firstName" 
                                [disabled]="!newFriend" #firstnameInput> 
                        </md-input-container>
                        <md-input-container class="inputField">
                            <input mdInput placeholder="Last Name" [value]="selectedFriend?.lastName" 
                                [disabled]="!newFriend" #lastnameInput> 
                        </md-input-container>
                    </section>
                    <md-dialog-actions>
                        <button md-button (click)="add(emailInput, nicknameInput, 
                                                    firstnameInput, lastnameInput)">Add</button>
                        <button md-button md-dialog-close>Cancel</button>
                    </md-dialog-actions>
                `,
  styleUrls: ['./add-friend-email-dialog.component.css']
})
export class AddFriendEmailDialogComponent implements OnInit, OnDestroy {
    errorMessageEmail: string;
    errorMessageNickname: string;

    newFriend = true;
    selectedFriend;
    currentUser: User;
    currentUserSubscription: Subscription;

    constructor(public dialogRef: MdDialogRef<AddFriendEmailDialogComponent>,
              private userService: UserService) {}

    ngOnInit() {
        this.currentUserSubscription = this.userService.currentUser$.subscribe(
            user => this.currentUser = user
        );
    }
    ngOnDestroy() {
        this.currentUserSubscription.unsubscribe();
    }

    add(emailInput, nicknameInput, firstnameInput, lastnameInput) {
        if (this.selectedFriend) {
            this.dialogRef.close(this.selectedFriend);
            return;
        }
        let email: string, nickname: string, firstname: string, lastname: string;
        email = emailInput.value;
        nickname = nicknameInput.value;
        if (firstnameInput) {
            firstname = firstnameInput.value;
        }
        if (lastnameInput) {
            lastname = lastnameInput.value;
        }
        const re = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$');
        const isValidEmail = re.test(email);
        const isNicknameDefined = nickname.trim().length > 0;
        if (isValidEmail && isNicknameDefined) {
            this.dialogRef.close(new Friend(firstname, lastname, nickname, email));
        } else {
            if (!isValidEmail) {
                this.errorMessageEmail = 'not a valid email';
            }
            if (!isNicknameDefined) {
                this.errorMessageNickname = 'nickname is mandatory';
            }
        }
    }

    toggleNewFriend() {
        this.newFriend = ! this.newFriend;
        if (this.newFriend) {
            this.resetFriend();
        }
    }
    toggleButtonText() {
        return this.newFriend ? 'New Friend' : 'From list';
    }
    setFriend(selectEevent) {
        console.log('sel event', selectEevent);
        const friendEmail = selectEevent.value;
        this.selectedFriend = this.currentUser.getFriend(friendEmail);
    }
    resetFriend() {
        this.selectedFriend = null;
    }
}
