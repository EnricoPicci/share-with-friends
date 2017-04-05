// import * as emailjs1 from '../../assets/lib/emailjs.min';
// declare var emailjs: any;

import { Injectable } from '@angular/core';

// import '../../assets/lib/emailjs.min';

// declare var emailjs: any;

@Injectable()
export class MailSenderEmailjsService {

  constructor() {
    // emailjs.init('user_X3ZGeBDrB26KbNW8oSPMt');
  }

  sendMail(fromEmail: string, toEmail: string, subject: string, body: string) {
    console.log('from', fromEmail);
    console.log('to', toEmail);
    console.log('sj', subject);
    console.log('bd', body);
    const messageParams = {toEmail, fromEmail, subject, body};
    // emailjs.send('mailgun',
    //               'share_with_friends',
    //               messageParams);
  }

}
