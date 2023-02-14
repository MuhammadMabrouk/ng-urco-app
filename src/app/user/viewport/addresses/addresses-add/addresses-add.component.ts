import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user/user.service';
import { AddressesService } from 'src/app/shared/services/user/addresses.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { UserAddresses } from 'src/app/shared/interfaces/user/user-addresses';
import { Geolocation } from 'src/app/shared/interfaces/geolocation';
import { CountryDropDown } from 'src/app/shared/interfaces/country-drop-down';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-addresses-add',
  templateUrl: './addresses-add.component.html',
  styleUrls: ['./addresses-add.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class AddressesAddComponent implements OnInit, OnDestroy {

  // addresses form
  addressesForm: FormGroup;

  // here to store countries
  userCountry: CountryDropDown;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    public userSer: UserService,
    private addressesSer: AddressesService,
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // addresses form
    this.addressesForm = this.fb.group({
      address: [null, [Validators.required]],
      region: [null, [Validators.required]],
      city: [null, [Validators.required]],
      street: [null, [Validators.required]],
      building: [null, [Validators.required]],
      floor: [null, [Validators.required]],
      addressTitle: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required, Validators.pattern(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)]],
      additionalInfo: null
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('address', this.translateSer.instant('add-address-page.address-label')),
        this.validatorsSer.anyRequired('region', this.translateSer.instant('add-address-page.region-label')),
        this.validatorsSer.anyRequired('city', this.translateSer.instant('add-address-page.city-label')),
        this.validatorsSer.anyRequired('street', this.translateSer.instant('add-address-page.street-label')),
        this.validatorsSer.anyRequired('building', this.translateSer.instant('add-address-page.building-label')),
        this.validatorsSer.anyRequired('floor', this.translateSer.instant('add-address-page.floor-label')),
        this.validatorsSer.anyRequired('addressTitle', this.translateSer.instant('add-address-page.address-title-label')),
        this.validatorsSer.anyRequired('phoneNumber', this.translateSer.instant('add-address-page.address-phone-number-label')),
        // Phone Number format validation
        this.validatorsSer.phoneNumberFormat('phoneNumber')
      ]
    });

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
    this.title.setTitle(this.translateSer.instant('add-address-page.page-title'));
  }

  // save new address on form submit
  saveNewAddress(form: FormGroup) {
    const values = form.getRawValue();
    const newObject: UserAddresses = {
      seqNo: Date.now(),
      addressTitle: values.addressTitle,
      address: values.address,
      region: values.region,
      city: values.city,
      street: values.street,
      building: values.building,
      floor: values.floor,
      fullPhoneNumber: `${this.userSer.userInfo.country ? this.userSer.userInfo.country.dial : this.userCountry.dial}${values.phoneNumber}`,
      additionalInfo: values.additionalInfo ? values.additionalInfo : '-'
    };

    // save new address on database
    this.mainLoadingSer.startLoading();
    this.addressesSer.addNewAddress(newObject)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.address-saved'), time: 5000});
        form.reset();
        this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.failed-address-exist'), time: 5000});
      });
  }

  // redirect to parent
  redirectToParent() {
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
  }
}
