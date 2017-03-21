import * as _ from 'lodash';

import {environment} from '../../../environments/environment';

import {MonetaryAmount} from './monetary-amount';

export class SharableThing {
    monetaryAmount: MonetaryAmount;
    private imageUrls: {[fileName: string]: string} = {};
    private coverImageUrl: string;

    constructor(
        public $key: string,
        public name: string,
        public description: string,
        public images?: Array<string>,
        public ownerEmail?: string,
        private friendEmails?: Array<{email: string, notified: boolean}>,
        public removed?: boolean,
        daylyChargeAmount?: number,
        daylyChargeCurrency?: string) {
            this.monetaryAmount = new MonetaryAmount(daylyChargeAmount, daylyChargeCurrency);
            if (!this.images) {this.images = []; }
            if (!this.friendEmails) {this.friendEmails = []; }
            if (!this.removed) {this.removed = false; }
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
        this.coverImageUrl = environment.defaultCoverImage;
        if (this.images.length > 0) {
            this.coverImageUrl = this.getRandomImageUrl();
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

}
