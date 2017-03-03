import { SharewithfriendsPage } from './app.po';

describe('sharewithfriends App', () => {
  let page: SharewithfriendsPage;

  beforeEach(() => {
    page = new SharewithfriendsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
