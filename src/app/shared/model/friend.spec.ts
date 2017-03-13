/* tslint:disable:no-unused-variable */

import {Friend} from './friend';

describe('Friend', () => {
    const firstName = 'first';
    const lastName = 'last';
    const nickName = 'nick';
    const email = 'a@b.com';

// Friend tests
  it('test creation of a friend', () => {
    const friend1 = new Friend(firstName, lastName, nickName, email);
    expect(friend1.firstName).toBe(firstName);
    expect(friend1.lastName).toBe(lastName);
    expect(friend1.nickName).toBe(nickName);
    expect(friend1.email).toBe(email);
  });

});
