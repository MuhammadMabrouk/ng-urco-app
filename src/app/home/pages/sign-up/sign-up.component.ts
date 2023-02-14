import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  animations: [fadeInUp]
})
export class SignUpComponent implements OnInit, OnDestroy {

  // Registration form
  signUpForm: FormGroup;
  nameMinLength: number = 3;
  passwordMinLength: number = 6;

  // here to store countries
  countries: Array<object>;

  // store subscription for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private router: Router,
    private route: ActivatedRoute,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private authSer: AuthService,
    private userSer: UserService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // Registration form
    this.signUpForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.minLength(this.nameMinLength)]],
      lastName: [null, [Validators.required, Validators.minLength(this.nameMinLength)]],
      email: [null, [Validators.required, Validators.email]],
      country: [null, Validators.required],
      password: [null, [Validators.required, Validators.minLength(this.passwordMinLength)]],
      confirmPassword: [null, [Validators.required, Validators.minLength(this.passwordMinLength)]],
      terms: [false, Validators.requiredTrue] // requires the control's value be true.
    }, {
      validator: [
        // firstName & lastName & email required validation
        this.validatorsSer.anyRequired('firstName', this.translateSer.instant('sign-up-page.sign-up-form.first-name-label')),
        this.validatorsSer.anyRequired('lastName', this.translateSer.instant('sign-up-page.sign-up-form.last-name-label')),
        this.validatorsSer.anyRequired('email', this.translateSer.instant('sign-up-page.sign-up-form.email-label')),
        // firstName & lastName minlength validation
        this.validatorsSer.anyMinLength(
          'firstName',
          this.translateSer.instant('sign-up-page.sign-up-form.first-name-label'),
          this.nameMinLength
        ),
        this.validatorsSer.anyMinLength(
          'lastName',
          this.translateSer.instant('sign-up-page.sign-up-form.last-name-label'),
          this.nameMinLength
        ),
        // Email format validation
        this.validatorsSer.emailFormat('email'),
        // passwords match validation
        this.validatorsSer.passwordsMatch('password', 'confirmPassword'),
        // password minlength validation
        this.validatorsSer.anyMinLength(
          'password',
          this.translateSer.instant('sign-up-page.sign-up-form.password-label'),
          this.passwordMinLength
        ),
        // cannot contain spaces validation
        this.validatorsSer.cannotContainSpaces('password', this.translateSer.instant('sign-up-page.sign-up-form.password-label')),
        // password required validation
        this.validatorsSer.passwordRequired('password', 'confirmPassword'),
        // confirm password required validation
        this.validatorsSer.confirmPasswordRequired('password', 'confirmPassword')
      ]
    });

    // get countries
    this.countries = this.generalSettingsSer.getAllCountries().map(country => {
      return {
        dial: country.dial,
        icon: country.flag,
        id: country.code,
        label: country.name
      };
    });
  }

  get firstName() { return this.signUpForm.get('firstName'); }
  get lastName() { return this.signUpForm.get('lastName'); }
  get email() { return this.signUpForm.get('email'); }
  get country() { return this.signUpForm.get('country'); }
  get password() { return this.signUpForm.get('password'); }
  get confirmPassword() { return this.signUpForm.get('confirmPassword'); }
  get terms() { return this.signUpForm.get('terms'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('sign-up-page.page-title'));
  }

  // get country value
  countryChanged(option: CountryDropDown) {
    this.signUpForm.patchValue({
      country: option
    });
  }

  // SignUp with popup
  signInWithPopup(providerName: string) {
    this.mainLoadingSer.startLoading();

    // add params to the url to redirect to the 'homepage' after sign up
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { returnUrl: '/' },
      replaceUrl: true
    });

    // add info of popup new users to the database
    this.authSer.signInWithPopup(providerName)
      .then(data => {
        this.userSer.preparePopupUserData(data);
        this.mainLoadingSer.endLoading();
      })
      .catch(err => {
        this.notifySer.setNotify({class: 'danger', msg: err, time: 5000});
        this.mainLoadingSer.endLoading();
      });
  }

  // SignUp with email & password
  emailSignUp(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    // add params to the url to prevent redirect to any where
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { returnUrl: 'condone' },
      replaceUrl: true
    });

    const formValue = form.value;
    const userData: UserProfile = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      displayName: `${formValue.firstName} ${formValue.lastName}`,
      userName: `${formValue.firstName}_${formValue.lastName}`.toLowerCase(),
      email: formValue.email,
      country: formValue.country,
      isAdmin: false
    };

    // add info of email new users to the database
    this.authSer.emailSignUp(formValue.email, formValue.password)
      .then(res => {
        const otherData = {
          id: res.user.uid,
          seqNo: Date.now(),
          registrationDate: (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string),
          providerId: res.additionalUserInfo.providerId
        };
        const allData = {...userData, ...otherData};

        this.userSer.addNewUserFromEmailSignUp(allData).then(() => {
          form.reset();
          // sign out
          this.authSer.logOut();
        });

        // Sending email verification notification, when new user registers
        res.user.sendEmailVerification()
          .then(() => {
            this.mainLoadingSer.endLoading();

            // redirect to the 'sign-in' page with the 'returnUrl'
            this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/' }});
          })
          .catch(() => this.mainLoadingSer.endLoading());

        this.notifySer.setNotify({
          class: 'success',
          msg: this.translateSer.instant('toast-notifications.successfully-registered'),
          time: 5000
        });
        this.notifySer.setNotify({
          class: 'info',
          msg: this.translateSer.instant('toast-notifications.verify-email-address'),
          time: 5000
        });
      })
      .catch(err => {
        this.notifySer.setNotify({class: 'danger', msg: err, time: 5000});
        this.mainLoadingSer.endLoading();
      });
  }

  // Function to Toggle Password Visibility
  togglePasswordVisibility(el) {
    this.globalJs.togglePasswordVisibility(el);
  }
}
