import {SharableThing} from './sharable-thing';
import {Friend} from './friend';

export class User {
    public sharableThings = new Array<SharableThing>();
    private friends = new Array<Friend>();
    public thingsOfferedToMeKeys = new Array<string>();

    constructor(
        public authUid?: string,
        public name?: string,
        public email?: string,
        public dbKey?: string,
        sharableThings?,
        friends?: Array<Friend>,
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

    getFriends() {
        return this.friends;
    }
    addFriend(friend: Friend) {
        if (this.isNewFriend(friend)) {
            this.friends.push(friend);
        }
    }
    isNewFriend(friend: Friend) {
        return this.friends.filter(friendIterated => friendIterated.email === friend.email)
                                                    .length === 0;
    }
    getFriend(email: string) {
        let ret = null;
        const friendArray = this.friends.filter(friendIterated => friendIterated.email === email);
        if (friendArray.length > 0) {
            ret = friendArray[0];
        }
        return ret;
    }
    resetFriends() {
        this.friends = [];
    }

    // returns the UID which is used when a user is created before he actually signup
    // this is the case when somebody adds a friend to a sharableThing using frined's email
    // but the friend has not yet signup
    getDefaultUid() {
        return 'uid';
    }
    hasUserAlreadySignedUp() {
        return this.authUid !== this.getDefaultUid();
    }

}
