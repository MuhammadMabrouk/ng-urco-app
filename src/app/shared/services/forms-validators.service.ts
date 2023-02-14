import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class FormsValidatorsService {

  constructor(
    private translateSer: TranslateService,
    private notifySer: NotificationsService
  ) { }

  // any field required validation
  anyRequired(fieldName: string, fieldTitle: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].hasError('required') && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}Required`,
          class: 'danger',
          msg: `${fieldTitle} ${this.translateSer.instant('toast-notifications.is-required')}`
        });
      } else if (!control[fieldName].hasError('required')) {
        this.notifySer.dismissNotify(`${fieldName}Required`);
      }
    };
  }

  // any field minlength validation
  anyMinLength(fieldName: string, fieldTitle: string, minlength: number) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].hasError('minlength') && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}Minlength`,
          class: 'danger',
          msg: `${fieldTitle}
          ${this.translateSer.instant('toast-notifications.must-be-at-least')}
          ${minlength}
          ${this.translateSer.instant('toast-notifications.characters')}`
        });
      } else if (!control[fieldName].hasError('minlength')) {
        this.notifySer.dismissNotify(`${fieldName}Minlength`);
      }
    };
  }

  // any field maxlength validation
  anyMaxLength(fieldName: string, fieldTitle: string, maxlength: number) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].hasError('maxlength') && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}MaxLength`,
          class: 'danger',
          msg: `${fieldTitle}
          ${this.translateSer.instant('toast-notifications.must-be-at-most')}
          ${maxlength}
          ${this.translateSer.instant('toast-notifications.characters')}`
        });
      } else if (!control[fieldName].hasError('maxlength')) {
        this.notifySer.dismissNotify(`${fieldName}MaxLength`);
      }
    };
  }

  // Email format validation
  emailFormat(fieldName: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].hasError('email') && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}NotValid`,
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.enter-valid-email')
        });
      } else if (!control[fieldName].hasError('email')) {
        this.notifySer.dismissNotify(`${fieldName}NotValid`);
      }
    };
  }

  // Phone Number format validation
  phoneNumberFormat(fieldName: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].invalid && !control[fieldName].hasError('required') && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}NotValid`,
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.enter-valid-phone')
        });
      } else if (control[fieldName].valid || control[fieldName].hasError('required')) {
        this.notifySer.dismissNotify(`${fieldName}NotValid`);
      }
    };
  }

  // Date format Validation
  dateFormat(fieldName: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].invalid && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}NotValid`,
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.enter-valid-date')
        });
      } else if (control[fieldName].valid) {
        this.notifySer.dismissNotify(`${fieldName}NotValid`);
      }
    };
  }

  // credit card number format Validation
  creditCardNumberFormat(fieldName: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].invalid && control[fieldName].dirty) {
        this.notifySer.setNotify({
          id: `${fieldName}NotValid`,
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.card-number-not-valid')
        });
      } else if (control[fieldName].valid) {
        this.notifySer.dismissNotify(`${fieldName}NotValid`);
      }
    };
  }

  // cannot contain spaces validation
  cannotContainSpaces(fieldName: string, fieldTitle: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[fieldName].value) {
        if (control[fieldName].value.indexOf(' ') > -1) {
          this.notifySer.setNotify({
            id: `${fieldName}Spaces`,
            class: 'danger',
            msg: `${fieldTitle} ${this.translateSer.instant('toast-notifications.cannot-contain-spaces')}`
          });
          this.manageErrors('add', control[fieldName], 'hasSpaces');
        } else if (control[fieldName].value.indexOf(' ') === -1) {
          this.notifySer.dismissNotify(`${fieldName}Spaces`);
          this.manageErrors('remove', control[fieldName], 'hasSpaces');
        }
      }
    };
  }

  // passwords match validation
  passwordsMatch(password: string, confirmPassword: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (
        control[password].valid && !control[confirmPassword].hasError('required') &&
        control[confirmPassword].value !== control[password].value && control[confirmPassword].dirty
        ) {
        this.notifySer.setNotify({
          id: 'passwordsMatch',
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.passwords-must-match')
        });
        this.manageErrors('add', control[confirmPassword], 'notEqual');
      } else if (control[password].valid && control[confirmPassword].value === control[password].value) {
        this.notifySer.dismissNotify('passwordsMatch');
        this.manageErrors('remove', control[confirmPassword], 'notEqual');
      } else if (control[password].invalid && !control[confirmPassword].value) {
        this.notifySer.dismissNotify('passwordsMatch');
      }
    };
  }

  // password required validation
  passwordRequired(password: string, confirmPassword: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[password].hasError('required') && control[confirmPassword].value && control[confirmPassword].dirty) {
        this.notifySer.setNotify({
          id: 'passwordRequired',
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.enter-password-first')
        });
      } else if (!control[password].hasError('required') || !control[confirmPassword].value) {
        this.notifySer.dismissNotify('passwordRequired');
      }
    };
  }

  // confirm password required validation
  confirmPasswordRequired(password: string, confirmPassword: string) {
    return (group: FormGroup) => {

      const control = group.controls;

      if (control[confirmPassword].hasError('required') && control[confirmPassword].dirty && control[password].valid) {
        this.notifySer.setNotify({
          id: 'confirmPasswordRequired',
          class: 'danger',
          msg: this.translateSer.instant('toast-notifications.confirm-your-password')
        });
      } else if (!control[confirmPassword].hasError('required')) {
        this.notifySer.dismissNotify('confirmPasswordRequired');
      }
    };
  }

  // checkboxes min required validation
  checkboxesMinRequired(checkboxesGroup: string, minRequired: number) {
    return (parentGroup: FormGroup) => {

      const group = ((parentGroup.controls[checkboxesGroup]) as FormGroup);
      let checked = 0;

      Object.keys(group.controls).forEach(key => {
        const control = group.controls[key];

        if (control.value === true) { checked++; }
      });

      if (checked < minRequired) {
        this.manageErrors('add', group, 'checkboxesMinRequired');
      } else {
        this.manageErrors('remove', group, 'checkboxesMinRequired');
      }
    };
  }

  // required file type validation
  requiredFileType(files: FileList, fieldTitle: string, types: string[]) {
    return new Promise((resolve, reject) => {

      if (files) {
        const extensions: string[] = Array.from(files).map(file => file.name.split('.')[1].toLowerCase());
        const typesInLowerCase: string[] = types.map(type => type.toLowerCase());
        const typesInMsg: string = types.map(type => type.toUpperCase()).join(', ').replace(/, ([^,]*)$/, ' or $1');
        const typeChecker = (arr: string[], target: string[]) => target.every(file => arr.includes(file));

        if (!typeChecker(typesInLowerCase, extensions)) {
          this.notifySer.setNotify({
            id: `${fieldTitle}FileType`,
            class: 'danger',
            msg: `${this.translateSer.instant('toast-notifications.not-valid-file-format')}
            (${typesInMsg})
            ${this.translateSer.instant('toast-notifications.for')}
            ${fieldTitle}.`,
            time: 5000
          });
          reject('Not a valid file format.');
        } else {
          this.notifySer.dismissNotify(`${fieldTitle}FileType`);
          resolve('Valid file format.');
        }
      }
    });
  }

  // this function adds and removes single error
  manageErrors(whatToDo: 'add' | 'remove', control: AbstractControl, err: string) {

    const errors = control.errors; // get control errors

    if (whatToDo === 'add') { // add errors

      // add your new error
      if (errors) {
        errors[err] = true;
        control.setErrors(errors);
      } else {
        control.setErrors({ [err]: true });
      }

    } else if (whatToDo === 'remove') { // remove errors

      if (errors) {
        // delete your error
        delete errors[err];

        // If any errors are left
        if (Object.keys(errors).length) {
          control.setErrors(errors); // controls got other errors so set them back
        } else {
          control.setErrors(null); // set control errors to null (making it VALID)
        }
      }
    }
  }
}
