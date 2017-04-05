import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import {AuthService} from '../providers/auth.service';
import {SessionService} from '../providers/session.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent implements OnInit {
  formErrors = {
    'email': '',
    'nickname': '',
    'password': '',
    'confirm': ''
  };
  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'pattern':       'The email is not correct.'
    },
    'nickname': {
      'required': 'Nickname is required.'
    },
    'password': {
      'required': 'Password is required.'
    },
    'confirm': {
      'required': 'Confir Password is required.'
    }
  };
  errorMessage: string;

  form: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private session: SessionService) {
    this.buildForm();
   }

  ngOnInit() {
    console.log('signup initial ROUTE', this.route);
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
                    nickname: ['', Validators.required],
                    password: ['', Validators.required],
                    confirm: ['', Validators.required]
                  });
    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onSubmit(formData) {
    const formValue = this.form.value;
    if (formValue.password !== formValue.confirm) {
      this.errorMessage = 'Confirmation password not valid';
    }
    this.authService.signUp(formValue.email, formValue.password, formValue.nickname)
                    .then(() => {
                      let path = 'sharableThingsList';
                      if (this.session.sharableThingKey) {
                        path = 'sharableThingShowcase';
                      }
                      console.log('Passing from here', path);
                      this.router.navigate([path], {skipLocationChange: true});
                    })
                    .catch(err => {
                      console.log('error at signup', err);
                      this.errorMessage = 'Signup failed. Reason: ' + err.message;
                    });
  }

  onValueChanged(data?: any) {
    console.log('form ', this.form);
    if (!this.form) { return; }
    const form = this.form;
    // tslint:disable-next-line:forin
    this.errorMessage = null;
    for (const field in this.formErrors) {
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          console.log('control error msg', messages[key]);
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

}
