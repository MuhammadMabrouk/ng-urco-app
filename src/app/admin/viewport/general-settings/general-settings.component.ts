import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GeneralSettings } from 'src/app/shared/interfaces/admin/general-settings';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideToggle
  ]
})
export class GeneralSettingsComponent implements OnInit, OnDestroy {

  // settings forms
  generalSettingsForm: FormGroup;
  adminDashboardSettingsForm: FormGroup;
  userDashboardSettingsForm: FormGroup;

  // to store initial values
  generalSettingsFormValue;
  adminDashboardSettingsFormValue;
  userDashboardSettingsFormValue;

  // to toggle visibility of save buttons
  generalSettingsFormChanged: boolean;
  adminDashboardSettingsFormChanged: boolean;
  userDashboardSettingsFormChanged: boolean;

  shopGoodsLimits;

  // here to store time zones
  timeZones: SelectMenu[];

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
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get general settings
    this.getGeneralSettings();

    // user info forms
    this.generalSettingsForm = this.fb.group({
      shopGoodsLimit: [0, Validators.required],
      shippingCost: [0, Validators.required],
      returnPeriod: [0, Validators.required],
      timeZone: [null, Validators.required]
    }, {
      validator: [
        // controls required validation,
        this.validatorsSer.anyRequired('shopGoodsLimit', this.translateSer.instant('general-settings-page.shop-goods-limit')),
        this.validatorsSer.anyRequired('shippingCost', this.translateSer.instant('general-settings-page.shipping-cost')),
        this.validatorsSer.anyRequired('returnPeriod', this.translateSer.instant('general-settings-page.return-period')),
        this.validatorsSer.anyRequired('timeZone', this.translateSer.instant('general-settings-page.time-zone'))
      ]
    });

    this.adminDashboardSettingsForm = this.fb.group({
      requestsLimit: [0, Validators.required],
      returnsLimit: [0, Validators.required],
      categoriesLimit: [0, Validators.required],
      goodsLimit: [0, Validators.required],
      usersLimit: [0, Validators.required],
      couponsLimit: [0, Validators.required],
      messagesLimit: [0, Validators.required],
      blackListEmailsLimit: [0, Validators.required],
      newsletterEmailsLimit: [0, Validators.required]
    }, {
      validator: [
        // controls required validation
        this.validatorsSer.anyRequired('requestsLimit', this.translateSer.instant('general-settings-page.requests-limit')),
        this.validatorsSer.anyRequired('returnsLimit', this.translateSer.instant('general-settings-page.returns-limit')),
        this.validatorsSer.anyRequired('categoriesLimit', this.translateSer.instant('general-settings-page.categories-limit')),
        this.validatorsSer.anyRequired('goodsLimit', this.translateSer.instant('general-settings-page.goods-limit')),
        this.validatorsSer.anyRequired('usersLimit', this.translateSer.instant('general-settings-page.users-limit')),
        this.validatorsSer.anyRequired('couponsLimit', this.translateSer.instant('general-settings-page.coupons-limit')),
        this.validatorsSer.anyRequired('messagesLimit', this.translateSer.instant('general-settings-page.messages-limit')),
        this.validatorsSer.anyRequired('blackListEmailsLimit', this.translateSer.instant('general-settings-page.blacklist-emails-limit')),
        this.validatorsSer.anyRequired('newsletterEmailsLimit', this.translateSer.instant('general-settings-page.newsletter-emails-limit'))
      ]
    });

    this.userDashboardSettingsForm = this.fb.group({
      ordersLimit: [0, Validators.required],
      addressesLimit: [0, Validators.required],
      paymentMethodsLimit: [0, Validators.required],
      returnedGoodsLimit: [0, Validators.required]
    }, {
      validator: [
        // controls required validation
        this.validatorsSer.anyRequired('ordersLimit', this.translateSer.instant('general-settings-page.orders-limit')),
        this.validatorsSer.anyRequired('addressesLimit', this.translateSer.instant('general-settings-page.addresses-limit')),
        this.validatorsSer.anyRequired('paymentMethodsLimit', this.translateSer.instant('general-settings-page.payment-methods-limit')),
        this.validatorsSer.anyRequired('returnedGoodsLimit', this.translateSer.instant('general-settings-page.returned-goods-limit'))
      ]
    });

    // get the limits array of goods in the shop page
    this.shopGoodsLimits = this.generalSettingsSer.shopGoodsLength.map(limit => {
      return {
        label: limit
      };
    });

    // get time zones
    this.timeZones = this.generalSettingsSer.getTimeZones().map(timezone => {
      return {
        id: timezone.zone.replace('/', '-'),
        label: `(${timezone.gmt}) ${timezone.name}`,
        gmt: timezone.gmt
      };
    });
  }

  get shopGoodsLimit() { return this.generalSettingsForm.get('shopGoodsLimit'); }
  get shippingCost() { return this.generalSettingsForm.get('shippingCost'); }
  get returnPeriod() { return this.generalSettingsForm.get('returnPeriod'); }
  get timeZone() { return this.generalSettingsForm.get('timeZone'); }
  get requestsLimit() { return this.adminDashboardSettingsForm.get('requestsLimit'); }
  get returnsLimit() { return this.adminDashboardSettingsForm.get('returnsLimit'); }
  get categoriesLimit() { return this.adminDashboardSettingsForm.get('categoriesLimit'); }
  get goodsLimit() { return this.adminDashboardSettingsForm.get('goodsLimit'); }
  get usersLimit() { return this.adminDashboardSettingsForm.get('usersLimit'); }
  get couponsLimit() { return this.adminDashboardSettingsForm.get('couponsLimit'); }
  get messagesLimit() { return this.adminDashboardSettingsForm.get('messagesLimit'); }
  get blackListEmailsLimit() { return this.adminDashboardSettingsForm.get('blackListEmailsLimit'); }
  get newsletterEmailsLimit() { return this.adminDashboardSettingsForm.get('newsletterEmailsLimit'); }
  get ordersLimit() { return this.userDashboardSettingsForm.get('ordersLimit'); }
  get addressesLimit() { return this.userDashboardSettingsForm.get('addressesLimit'); }
  get paymentMethodsLimit() { return this.userDashboardSettingsForm.get('paymentMethodsLimit'); }
  get returnedGoodsLimit() { return this.userDashboardSettingsForm.get('returnedGoodsLimit'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('general-settings-page.page-title'));
  }

  // get general settings
  getGeneralSettings() {
    this.mainLoadingSer.startLoading();

    this.generalSettingsSer.getGeneralSettings().then(res => {
      const data: GeneralSettings = res.data();

      if (data) {
        this.generalSettingsForm.patchValue({
          shopGoodsLimit: data.shopGoodsLimit,
          shippingCost: data.shippingCost || 0,
          returnPeriod: data.returnPeriod || 0,
          timeZone: data.timeZone || null
        });

        this.adminDashboardSettingsForm.patchValue({
          requestsLimit: data.requestsLimit || 0,
          returnsLimit: data.returnsLimit || 0,
          categoriesLimit: data.categoriesLimit || 0,
          goodsLimit: data.goodsLimit || 0,
          usersLimit: data.usersLimit || 0,
          couponsLimit: data.couponsLimit || 0,
          messagesLimit: data.messagesLimit || 0,
          blackListEmailsLimit: data.blackListEmailsLimit || 0,
          newsletterEmailsLimit: data.newsletterEmailsLimit || 0
        });

        this.userDashboardSettingsForm.patchValue({
          ordersLimit: data.ordersLimit || 0,
          addressesLimit: data.addressesLimit || 0,
          paymentMethodsLimit: data.paymentMethodsLimit || 0,
          returnedGoodsLimit: data.returnedGoodsLimit || 0
        });
      }

      // get the default values from the database and set it to the form controls
      this.generalSettingsFormValue = JSON.stringify(this.generalSettingsForm.getRawValue());
      this.adminDashboardSettingsFormValue = JSON.stringify(this.adminDashboardSettingsForm.getRawValue());
      this.userDashboardSettingsFormValue = JSON.stringify(this.userDashboardSettingsForm.getRawValue());

      // listening for changes in the default values to show save buttons
      this.onChanges();

      this.mainLoadingSer.endLoading();
    });
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.generalSettingsForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.generalSettingsForm.getRawValue()) !== this.generalSettingsFormValue) {
        this.generalSettingsFormChanged = true;
      } else { this.generalSettingsFormChanged = false; }
    }));

    this.subscriptions.push(this.adminDashboardSettingsForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.adminDashboardSettingsForm.getRawValue()) !== this.adminDashboardSettingsFormValue) {
        this.adminDashboardSettingsFormChanged = true;
      } else { this.adminDashboardSettingsFormChanged = false; }
    }));

    this.subscriptions.push(this.userDashboardSettingsForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.userDashboardSettingsForm.getRawValue()) !== this.userDashboardSettingsFormValue) {
        this.userDashboardSettingsFormChanged = true;
      } else { this.userDashboardSettingsFormChanged = false; }
    }));
  }

  // update general settings
  updateValue(form: FormGroup, controlName: string, value: number) {
    form.patchValue({
      [controlName]: +value
    });
  }

  // shop goods limit changed
  shopGoodsLimitChanged(value: SelectMenu) {
    this.generalSettingsForm.patchValue({
      shopGoodsLimit: value.label
    });
  }

  // timezone value changed
  timeZoneChanged(value: { id: string; gmt: string; label: string; }) {
    this.generalSettingsForm.patchValue({
      timeZone: {
        gmt: value.gmt,
        name: value.label,
        zone: value.id.replace('-', '/')
      }
    });
  }

  // update general settings
  updateGeneralSettings(form: FormGroup, name: string) {
    this.mainLoadingSer.startLoading();

    this.generalSettingsSer.updateGeneralSettings(form.getRawValue(), name)
      .then(() => {
        this[`${name}Value`] = JSON.stringify(form.getRawValue()); // get and set the new values
        this[`${name}Changed`] = false; // hide save buttons
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.changes-saved'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }
}
