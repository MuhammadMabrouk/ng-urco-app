import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { ContactFormSettingsService } from 'src/app/shared/services/admin/contact-form/contact-form-settings.service';
import { ContactFormSettings } from 'src/app/shared/interfaces/admin/contact-form/contact-form-settings';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideFadeRedHighlight } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade-red-highlight';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-contact-form-settings',
  templateUrl: './contact-form-settings.component.html',
  styleUrls: ['./contact-form-settings.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideFadeRedHighlight,
    slideToggle
  ]
})
export class ContactFormSettingsComponent implements OnInit, OnDestroy {

  // contact settings form
  contactSettingsForm: FormGroup;

  // to store initial values
  contactSettingsFormValue;

  // to toggle visibility of save button
  contactSettingsFormChanged: boolean;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private cfSettingsSer: ContactFormSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get contact form settings
    this.getContactFormSettings();

    // contact settings form
    this.contactSettingsForm = this.fb.group({
      nameLength: [0, Validators.required],
      messageLength: [0, Validators.required],
      subjects: this.fb.array([])
    }, {
      validator: [
        // controls required validation,
        this.validatorsSer.anyRequired('nameLength', this.translateSer.instant('contact-form-settings-page.name-length')),
        this.validatorsSer.anyRequired('messageLength', this.translateSer.instant('contact-form-settings-page.message-length')),
        this.validatorsSer.anyRequired('subjects', this.translateSer.instant('contact-form-settings-page.subject-label'))
      ]
    });
  }

  get nameLength() { return this.contactSettingsForm.get('nameLength'); }
  get messageLength() { return this.contactSettingsForm.get('messageLength'); }
  get subjects() { return this.contactSettingsForm.get('subjects') as FormArray; }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('contact-form-settings-page.page-title'));
  }

  // get contact from settings
  getContactFormSettings() {
    this.mainLoadingSer.startLoading();

    this.cfSettingsSer.getContactFormSettings().then(res => {
      const data: ContactFormSettings = res.data();

      if (data) {
        this.contactSettingsForm.patchValue({
          nameLength: data.nameLength || 0,
          messageLength: data.messageLength || 0
        });

        // set the subjects
        if (data.subjects) {
          data.subjects.forEach(subject => this.subjects.push(this.fb.control(subject)));
        }
      }

      // get the default values from the database and set it to the form controls
      this.contactSettingsFormValue = JSON.stringify(this.contactSettingsForm.getRawValue());

      // listening for changes in the default values to show save buttons
      this.onChanges();

      this.mainLoadingSer.endLoading();
    });
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.contactSettingsForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.contactSettingsForm.getRawValue()) !== this.contactSettingsFormValue) {
        this.contactSettingsFormChanged = true;
      } else { this.contactSettingsFormChanged = false; }
    }));
  }

  // update form values
  updateValue(form: FormGroup, controlName: string, value: number) {
    form.patchValue({
      [controlName]: +value
    });
  }

  // add new subject
  addNewSubject(value: string) {
    this.subjects.push(this.fb.control(value));
  }

  // remove subject
  removeSubject(index: number) {
    this.subjects.removeAt(index);
  }

  // update contact form settings
  updateContactFormSettings(form: FormGroup) {
    this.mainLoadingSer.startLoading();
    this.cfSettingsSer.updateContactFormSettings(form.getRawValue())
      .then(() => {
        this.contactSettingsFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.contactSettingsFormChanged = false; // hide save button
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.changes-saved'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }
}
