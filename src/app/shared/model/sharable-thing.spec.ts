/* tslint:disable:no-unused-variable */

import { SharableThing } from './sharable-thing';
import { MonetaryAmount } from './monetary-amount';

import {environment} from '../../../environments/environment';

describe('SharableThing', () => {

// SharableThing tests
    const key = 'key';
    const name = 'a thing';
    const description = 'a thing to share';
    const images = [];
    const ownerEmail = 'owner email';
    const friendEmails = [{email: 'f1 email', notified: false}, {email: 'f2 email', notified: false}];
    const monetaryAmountAmount = 80;

  const monetaryAmount1 = new MonetaryAmount(monetaryAmountAmount);
  it('test creation of a SharableThing with charge in EUR', () => {
    const sharableThing1 = new SharableThing(key, 'a thing', 'a thing to share', [],
                                              ownerEmail, friendEmails, false, {amount: 80});
    // expect(sharableThing1.$key).toBe(key);
    expect(sharableThing1.$key).toBe(key);
    expect(sharableThing1.name).toBe(name);
    expect(sharableThing1.description).toBe(description);
    expect(sharableThing1.images).toEqual(images);
    expect(sharableThing1.ownerEmail).toEqual(ownerEmail);
    expect(sharableThing1.getFriendEmails()).toEqual(friendEmails);
    expect(sharableThing1.monetaryAmount).toEqual(monetaryAmount1);
  });

  const monetaryAmountCurrency = 'USD';
  const monetaryAmount2 = new MonetaryAmount(monetaryAmountAmount, monetaryAmountCurrency);
  it('test creation of a SharableThing with charge in USD', () => {
    const sharableThing2 = new SharableThing(key, 'a thing', 'a thing to share', [],
                                            ownerEmail, friendEmails, false, {amount: 80, currency: monetaryAmountCurrency});
    // expect(sharableThing2.$key).toBe(key);
    expect(sharableThing2.name).toBe(name);
    expect(sharableThing2.description).toBe(description);
    expect(sharableThing2.images).toEqual(images);
    expect(sharableThing2.ownerEmail).toEqual(ownerEmail);
    expect(sharableThing2.getFriendEmails()).toEqual(friendEmails);
    expect(sharableThing2.monetaryAmount).toEqual(monetaryAmount2);
  });

  it('test that images are never undefined', () => {
    const sharableThing3 = new SharableThing(null, null, null);
    expect(sharableThing3.images).toEqual([]);
  });

  it('test that default cover image url is returned', () => {
    const sharableThing4 = new SharableThing(null, null, null);
    expect(sharableThing4.getCoverImageUrl()).toEqual(environment.defaultCoverImage);
  });
  it('test that the only cover image url is returned', () => {
    const imageFileName = 'onlyCoverImage';
    const imageUrl = 'onlyCoverImageUrl';
    const sharableThing5 = new SharableThing(null, null, null, [imageFileName]);
    sharableThing5.addImageUrl(imageFileName, imageUrl);
    const imageUrlRetrieved = sharableThing5.getCoverImageUrl();
    expect(imageUrlRetrieved).toEqual(imageUrl);
  });
  it('test that the cover image url returned belongs to the set of images defined when creating the sharable thing', () => {
    const imageFileNames = ['img1', 'img2', 'img3', 'img4'];
    const imageUrls1 = ['img1Url', 'img2Url', 'img3Url', 'img4Url'];
    const sharableThing6 = new SharableThing(null, null, null, imageFileNames);
    sharableThing6.addImageUrl(imageFileNames[0], imageUrls1[0]);
    sharableThing6.addImageUrl(imageFileNames[1], imageUrls1[1]);
    sharableThing6.addImageUrl(imageFileNames[2], imageUrls1[2]);
    sharableThing6.addImageUrl(imageFileNames[3], imageUrls1[3]);
    const imageUrlRetrieved = sharableThing6.getCoverImageUrl();
    const indexOfCoverImageUrl = imageUrls1.indexOf(imageUrlRetrieved);
    expect(indexOfCoverImageUrl > -1).toBeTruthy();
  });

});
