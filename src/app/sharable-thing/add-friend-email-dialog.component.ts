import { Component } from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  template: `
                    <h3>add email of a friend</h3>
                    <md-dialog-actions>
                        <md-input-container>
                            <input mdInput placeholder="Email" #emailInput type="email">
                            <md-hint *ngIf="errorMessage" [ngStyle]="{'color': 'red'}" align="start">{{errorMessage}}</md-hint> 
                        </md-input-container>
                        <button md-button (click)="addEmail(emailInput.value)">Add</button>
                        <button md-button md-dialog-close>Cancel</button>
                    </md-dialog-actions>
                `
})
export class AddFriendEmailComponent {
    errorMessage: string;

    constructor(public dialogRef: MdDialogRef<AddFriendEmailComponent>) {}

    addEmail(email) {
        const re = new RegExp('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$');
        const isValidEmail = re.test(email);
        if (!isValidEmail) {
            this.errorMessage = 'not a valid email';
            console.log('dialog error', this.errorMessage);
        } else {
            this.dialogRef.close(email);
        }
    }
}
