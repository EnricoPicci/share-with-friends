import { Component, Inject } from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';

@Component({
  template: `
                    <h3 md-dialog-title>warning</h3>
                    <md-dialog-content>{{data.message}}</md-dialog-content>
                    <md-dialog-actions>
                        <button md-button md-dialog-close>Got it</button>
                    </md-dialog-actions>
                `,
  styleUrls: ['./calendar-dialog.component.css']
})
export class CalendarDialogComponent {
    constructor(public dialogRef: MdDialogRef<CalendarDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) {}

}
