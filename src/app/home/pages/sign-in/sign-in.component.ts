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
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  animations: [fadeInUp]
})
export class SignInComponent implements OnInit, OnDestroy {

  // sign in form
  signInForm: FormGroup;
  passwordMinLength: number = 6;

  // store subscription for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private authSer: AuthService,
    private userSer: UserService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // sign in form
    this.signInForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(this.passwordMinLength)]]
    }, {
      validator: [
        // email & password required validation
        this.validatorsSer.anyRequired('email', this.translateSer.instant('sign-in-page.sign-in-form.email-label')),
        this.validatorsSer.anyRequired('password', this.translateSer.instant('sign-in-page.sign-in-form.password-label')),
        // Email format validation
        this.validatorsSer.emailFormat('email'),
        // password minlength validation
        this.validatorsSer.anyMinLength(
          'password',
          this.translateSer.instant('sign-in-page.sign-in-form.password-label'),
          this.passwordMinLength
        ),
        // cannot contain spaces validation
        this.validatorsSer.cannotContainSpaces('password', this.translateSer.instant('sign-in-page.sign-in-form.password-label'))
      ]
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('sign-in-page.page-title'));
  }

  get email() { return this.signInForm.get('email'); }
  get password() { return this.signInForm.get('password'); }

  // SignIn with popup
  signInWithPopup(providerName: string) {
    this.mainLoadingSer.startLoading();

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

  // SignIn with email & password
  emailSignIn(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const data = form.value;

    this.authSer.emailSignIn(data.email, data.password)
      .then(res => {
        if (res.user.emailVerified === false) {
          // sign out
          this.authSer.logOut();

          // Sending email verification notification, when new user registers
          this.authSer.SendVerificationMail();

          this.notifySer.setNotify({
            class: 'danger',
            msg: this.translateSer.instant('toast-notifications.verify-email-address'),
            time: 5000
          });

        } else { form.reset(); }

        this.mainLoadingSer.endLoading();
      })
      .catch(err => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: err, time: 5000});
      });
  }

  // Reset Password
  resetPassword(email) {
    this.mainLoadingSer.startLoading();

    this.authSer.resetPassword(email)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({
          class: 'success',
          msg: this.translateSer.instant('toast-notifications.password-reset-email-should-arrive-shortly'),
          time: 5000
        });
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.type-email-to-receive-password-reset-link'), time: 5000});
      });
  }

  // Function to Toggle Password Visibility
  togglePasswordVisibility(el) {
    this.globalJs.togglePasswordVisibility(el);
  }
}
