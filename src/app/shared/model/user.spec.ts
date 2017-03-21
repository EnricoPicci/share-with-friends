/* tslint:disable:no-unused-variable */

import {User} from './user';

describe('User', () => {
    const authId = 'auth id';
    const userEmail = 'testuserservice@my.com';
    const userPwd = 'mypassw';
    const userName = 'my name';
    const dbKey = 'db key';
    const sharableThings = ['one', 'two'];
    const friends = ['three', 'four'];

// User tests
  it('test creation of a user', () => {
    const user = new User(authId, userName, userEmail, dbKey);
    expect(user.authUid).toBe(authId);
    expect(user.name).toBe(userName);
    expect(user.email).toBe(userEmail);
    expect(user.dbKey).toBe(dbKey);
    expect(user.sharableThings.length).toEqual(0);
  });

  it('test creation of a user from json', () => {
      const jsonObj = {
          authUid: authId,
          dbKey: dbKey,
          email: userEmail,
          name: userName,
          sharableThings: sharableThings,
          friends: friends,
          thingsOfferedToMeKeys: []
      };
    const user = User.fromJson(jsonObj);
    expect(user.authUid).toBe(authId);
    expect(user.name).toBe(userName);
    expect(user.email).toBe(userEmail);
    expect(user.dbKey).toBe(dbKey);
    expect(user.sharableThings).toEqual(sharableThings);
  });

});
