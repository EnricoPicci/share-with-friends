import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder} from '@angular/forms';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'friend-form',
  templateUrl: './friend-form.component.html',
  styleUrls: ['./friend-form.component.css']
})
export class FriendFormComponent implements OnInit {
  formErrors = {
    'email': '',
    'firstName': '',
    'lastName': '',
    'nickName': ''
  };
  validationMessages = {
    'email': {
      'required':      'Email is required.',
      'pattern':       'The email is not correct.'
    },
    'nickName': {
      'required': 'Nickname is required.'
    }
  };
  errorMessage: string;

  form: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
                    email: ['', [
                            Validators.required,
                            Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')
                            ]],
                    nickname: ['', Validators.required],
                    firstName: [''],
                    lastName: ['']
                  });
    this.form.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
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
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

}
