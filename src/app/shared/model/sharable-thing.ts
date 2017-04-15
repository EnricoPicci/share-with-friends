import * as _ from 'lodash';

import {environment} from '../../../environments/environment';

import {MonetaryAmount} from './monetary-amount';
import {User} from './user';
import {Friend} from './friend';
import {CalendarBook} from './calendar-book';
import {CalendarBookJsonInterface} from './calendar-book-json.interface';
import {Booking} from './booking';

export class SharableThing {
    monetaryAmount: MonetaryAmount;
    private imageUrls: {[fileName: string]: string} = {};
    private coverImageUrl: string;
    private calendarBook: CalendarBook;

    constructor(
        public $key: string,
        public name: string,
        public description: string,
        public images?: Array<string>,
        public ownerEmail?: string,
        private friendEmails?: Array<{email: string, notified: boolean}>,
        public removed?: boolean,
        daylyChargeAmount?: number,
        daylyChargeCurrency?: string,
        calendarBookJson?: CalendarBookJsonInterface) {
            this.monetaryAmount = new MonetaryAmount(daylyChargeAmount, daylyChargeCurrency);
            if (!this.images) {this.images = []; }
            if (!this.friendEmails) {this.friendEmails = []; }
            if (!this.removed) {this.removed = false; }
            const calendarBook = new CalendarBook(calendarBookJson);
            this.setCalendarBook(calendarBook);
    }

    // tslint:disable-next-line:member-ordering
    static fromJson({$key, name, description, images,
                    ownerEmail, friendEmails, removed,
                    daylyChargeAmount, daylyChargeCurrency}) {
        return new SharableThing($key, name, description, images,
                                ownerEmail, friendEmails, removed,
                                daylyChargeAmount, daylyChargeCurrency);
    }

    static fromJsonArray(json: any[]): SharableThing[] {
        return json.map(SharableThing.fromJson);
    }

    getFriendEmails() {
        return this.friendEmails;
    }
    getFriendEmailStrings() {
        return this.getMailArray(this.friendEmails);
    }
    addFriendEmail(email: string, notified: boolean = false) {
        const indexOfEmail = this.getMailArray(this.friendEmails).indexOf(email);
        // if index is -1 then the email has not been found in the current emails and therefore it is a new friendEmail
        if (indexOfEmail === -1) {
            // short javascript version:{email, notified} is equivalent to {email: email, notified: notified}
            this.friendEmails.push({email, notified});
        }
    }
    removeFriendEmail(email: string) {
        const indexOfEmail = this.getMailArray(this.friendEmails).indexOf(email);
        if (indexOfEmail === -1) {
            this.friendEmails.splice(indexOfEmail, 1);
        }
    }
    private getMailArray(friendsEmails: {email: string, notified: boolean}[]) {
        return this.friendEmails.map(fe => fe.email);
    }

    getCoverImageUrl() {
        if (this.coverImageUrl) {
            return this.coverImageUrl;
        }
        if (this.images.length > 0) {
            this.coverImageUrl = this.getRandomImageUrl();
        } else {
            this.coverImageUrl = environment.defaultCoverImage;
        }
        return this.coverImageUrl;
    }
    getRandomImageUrl() {
        const numberOfImages = this.images.length;
        const image = this.images[this.getRandomInt(0, numberOfImages - 1)];
        return this.imageUrls[image];
    }
    private getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    addImageUrl(fileName: string, imageUrl: string) {
        this.imageUrls[fileName] = imageUrl;
    }
    getImageUrls() {
        const ret = Object.keys(this.imageUrls).map(key => this.imageUrls[key]);
        if (ret.length === 0) {
            ret.push(environment.defaultCoverImage);
        }
        return ret;
    }
    getImageFileNameForUrl(url: string) {
        return _.findKey(this.imageUrls, function(o) { return o === url; });
    }
    resetImageUrls() {
        this.imageUrls = {};
    }
    resetImages() {
        this.resetImageUrls();
        this.images = [];
    }

    getNotNotifiedEmails() {
        return this.friendEmails.filter(friendEmail => !friendEmail.notified);
    }

    createMessageForFriend(user: User, friend: Friend, link: string) {
        const subject = 'There is a thing for you';
        const body = 'Dear ' + friend.firstName + ',\n'
                        + user.name + ' would like to share with you a \"' + this.name + '\".\n'
                        + 'Take a look at the following link ' + link + '.\n'
                        + 'Ciao \n'
                        + 'The sharing App';
        return {subject, body};
    }

    getCalendarBook() {
        return this.calendarBook;
    }
    setCalendarBook(calendarBook: CalendarBook) {
        this.calendarBook = calendarBook;
    }

    addBooking(from: Date, to: Date, userBookingEmail: string) {
        let booking: Booking;
        if (this.calendarBook.isDateIntervalFree(from, to)) {
            booking = new Booking(null , from, to, this.$key, userBookingEmail, false);
            this.calendarBook.addBooking(booking);
        }
        return booking;
        // const booking = new Booking(null , from, to, this.$key, userBookingEmail, false);
        // this.calendarBook.addBooking(booking);
        // return booking;
    }
    removeBooking(booking: Booking) {
        this.calendarBook.removeBooking(booking);
    }

}
