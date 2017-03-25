import { TestBed, inject } from '@angular/core/testing';

import { MailSenderEmailjsService } from './mail-sender-emailjs.service';

describe('MailSenderEmailjsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MailSenderEmailjsService]
    });
  });

  it('should ...', inject([MailSenderEmailjsService], (service: MailSenderEmailjsService) => {
    expect(service).toBeTruthy();
  }));
});
