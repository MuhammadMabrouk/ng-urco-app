import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { ContactFormMessagesService } from 'src/app/shared/services/admin/contact-form/contact-form-messages.service';
import { ContactFormBlacklistService } from 'src/app/shared/services/admin/contact-form/contact-form-blacklist.service';
import { ContactFormSettingsService } from 'src/app/shared/services/admin/contact-form/contact-form-settings.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { ContactFormMessages } from 'src/app/shared/interfaces/admin/contact-form/contact-form-messages';
import { ContactFormSettings } from 'src/app/shared/interfaces/admin/contact-form/contact-form-settings';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';
import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';
import { Geolocation } from 'src/app/shared/interfaces/geolocation';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    fadeInUp
  ]
})
export class ContactComponent implements OnInit, OnDestroy {

  // contact us form
  contactForm: FormGroup;
  // form controls validation
  nameMinLength: number = 6;
  messageMinLength: number = 200;

  // here to store countries
  userCountry: CountryDropDown;

  // types for subject select menu
  subjectTypes: SelectMenu[] = [];

  // store subscription for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    public userSer: UserService,
    private cfMessagesSer: ContactFormMessagesService,
    private cfBlackListSer: ContactFormBlacklistService,
    private cfSettingsSer: ContactFormSettingsService,
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

    // get contact form settings
    this.getContactFormSettings();

    // get user country data
    this.userSer.getUserCountryData().toPromise().then((res: Geolocation) => {
      const countries = this.generalSettingsSer.getAllCountries(); // get all countries
      this.userCountry = countries.find(country => country.code === res.countryCode); // get user country
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('contact-us-page.page-title'));
  }

  // get contact from settings
  getContactFormSettings() {
    this.mainLoadingSer.startLoading();

    this.cfSettingsSer.getContactFormSettings().then(res => {
      const data: ContactFormSettings = res.data();

      if (data) {
        // form controls validation
        this.nameMinLength = data.nameLength;
        this.messageMinLength = data.messageLength;
        data.subjects.map(subject => {
          this.subjectTypes.push({ label: subject });
        });

        // contact us form
        this.contactForm = this.fb.group({
          fullName: [null, [Validators.required, Validators.minLength(data.nameLength)]],
          email: [null, [Validators.required, Validators.email]],
          phoneNumber: [null, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)],
          subject: [null, Validators.required],
          message: [null, [Validators.required, Validators.minLength(data.messageLength)]]
        }, {
          validator: [
            // controls required validation
            this.validatorsSer.anyRequired(
              'fullName',
              this.translateSer.instant('contact-us-page.contact-form.full-name-label')
            ),
            this.validatorsSer.anyRequired(
              'email',
              this.translateSer.instant('contact-us-page.contact-form.email-label')
            ),
            this.validatorsSer.anyRequired(
              'subject',
              this.translateSer.instant('contact-us-page.contact-form.subject-label')
            ),
            this.validatorsSer.anyRequired(
              'message',
              this.translateSer.instant('contact-us-page.contact-form.message-label')
            ),
            // controls minlength validation
            this.validatorsSer.anyMinLength(
              'fullName',
              this.translateSer.instant('contact-us-page.contact-form.full-name-label'),
              data.nameLength
            ),
            this.validatorsSer.anyMinLength(
              'message',
              this.translateSer.instant('contact-us-page.contact-form.message-label'),
              data.messageLength
            ),
            // Email format validation
            this.validatorsSer.emailFormat('email'),
            // Phone Number format validation
            this.validatorsSer.phoneNumberFormat('phoneNumber')
          ]
        });
      }

      this.mainLoadingSer.endLoading();
    });
  }

  // get subject type value
  subjectChanged(option: SelectMenu) {
    this.contactForm.patchValue({
      subject: option
    });
  }

  // send user message
  sendMessage(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    // today date in nice format
    const today = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string);
    const phoneNumber = `${this.userCountry.dial}${values.phoneNumber}`;

    const data: ContactFormMessages = {
      seqNo: Date.now(),
      name: values.fullName,
      email: values.email,
      phone: values.phoneNumber ? phoneNumber : null,
      subject: values.subject,
      message: values.message,
      receivedDate: today,
      readingDate: null
    };

    // check if email is blocked or not
    this.cfBlackListSer.checkIfEmailBlocked(data.email)
      .then(doc => {
        if (!doc.exists) {

          // send the message
          this.cfMessagesSer.addNewMessage(data)
            .then(() => {
              this.mainLoadingSer.endLoading();
              this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.message-sent'), time: 5000});
              // reset the form after sending the message
              form.reset();
            })
            .catch(() => {
              this.mainLoadingSer.endLoading();
              this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
            });

        } else {
          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.this-email-blocked'), time: 5000});
        }
      })
      .catch(() => {
        // send the message
        this.cfMessagesSer.addNewMessage(data)
          .then(() => {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.message-sent'), time: 5000});
            // reset the form after sending the message
            form.reset();
          })
          .catch(() => {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
          });
      });
  }
}
