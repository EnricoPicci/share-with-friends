import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {AuthService} from '../providers/auth.service';
import {SessionService} from '../providers/session.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  formErrors = {
    'email': '',
    'password': ''
  };
  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'pattern':       'The email is not correct.'
    },
    'password': {
      'required': 'Password is required.'
    }
  };
  failedLoginMessage: string;

  form: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private session: SessionService) {
    this.buildForm();
   }

  ngOnInit() {
    if (this.session.userMail) {
      this.form.controls['email'].setValue(this.session.userMail);
    }
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
                    email: ['', [
                            Validators.required,
                            Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
                            ]],
                    password: ['', Validators.required]
                  });
    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onSubmit(formData) {
    console.log('Submit of Login', this.session.path);
    const formValue = this.form.value;
    this.authService.login(formValue.email, formValue.password)
                    .then(() => {
                      const path = this.session.path || 'sharableThingsList';
                      console.log('Passing from here', path);
                      // this.router.navigate([path], {skipLocationChange: true});
                      this.router.navigate([path]);
                    })
                    .catch(err => {
                      console.log('error at login', err);
                      this.failedLoginMessage = 'Login failed. Reason: ' + err.message;
                    });
  }

  onValueChanged(data?: any) {
    if (!this.form) { return; }
    const form = this.form;
    // tslint:disable-next-line:forin
    this.failedLoginMessage = null;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  goToSignup() {
    this.router.navigate(['signup'], { relativeTo: this.route, skipLocationChange: true });
  }

}
