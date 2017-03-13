import {SharableThing} from './sharable-thing';
import {Friend} from './friend';

export class User {
    public sharableThings = new Array<SharableThing>();
    public friends = new Array<Friend>();
    public thingsOfferedToMeKeys = new Array<string>();

    constructor(
        public authUid?: string,
        public name?: string,
        public email?: string,
        public dbKey?: string,
        sharableThings?,
        friends?,
        thingsOfferedToMeKeys?
    ) {
        if (sharableThings) {
            this.sharableThings = sharableThings;
        };
        if (friends) {
            this.friends = friends;
        }
        if (thingsOfferedToMeKeys) {
            this.thingsOfferedToMeKeys = thingsOfferedToMeKeys;
        }
    }

    // tslint:disable-next-line:member-ordering
    static fromJson({authUid, name, email, dbKey, sharableThings, friends, thingsOfferedToMeKeys}) {
        return new User(authUid, name, email, dbKey, sharableThings, friends, thingsOfferedToMeKeys);
    }

}
