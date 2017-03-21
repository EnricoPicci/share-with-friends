import { Component } from '@angular/core';
import {MdDialogRef} from '@angular/material';

import {Friend} from '../shared/model/friend';

@Component({
  template: `
                    <h3>add a friend</h3>
                    <md-input-container>
                        <input mdInput placeholder="Email" #emailInput type="email">
                        <md-hint *ngIf="errorMessageEmail" [ngStyle]="{'color': 'red'}" align="start">{{errorMessageEmail}}</md-hint> 
                    </md-input-container>
                    <md-input-container>
                        <input mdInput placeholder="Nickname" #nicknameInput>
                        <md-hint *ngIf="errorMessageNickname" [ngStyle]="{'color': 'red'}" align="start">{{errorMessageNickname}}</md-hint> 
                    </md-input-container>
                    <md-input-container>
                        <input mdInput placeholder="First Name" #firstnameInput> 
                    </md-input-container>
                    <md-input-container>
                        <input mdInput placeholder="Last Name" #lastnameInput> 
                    </md-input-container>
                    <md-dialog-actions>
                        <button md-button (click)="add(emailInput.value, nicknameInput.value, 
                                                    firstnameInput.value, lastnameInput.value)">Add</button>
                        <button md-button md-dialog-close>Cancel</button>
                    </md-dialog-actions>
                `
})
export class AddFriendEmailComponent {
    errorMessageEmail: string;
    errorMessageNickname: string;

    constructor(public dialogRef: MdDialogRef<AddFriendEmailComponent>) {}

    add(email: string, nickname: string, firstname: string, lastname: string) {
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
}
