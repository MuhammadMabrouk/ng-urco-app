import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { AddressesService } from 'src/app/shared/services/user/addresses.service';
import { UserAddresses } from 'src/app/shared/interfaces/user/user-addresses';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-addresses-edit',
  templateUrl: './addresses-edit.component.html',
  styleUrls: ['./addresses-edit.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideToggle
  ]
})
export class AddressesEditComponent implements OnInit, OnDestroy {

  addressId: string; // edited address id

  addressesForm: FormGroup; // addresses form
  addressesFormValue; // to store initial values
  // to toggle visibility of save button
  addressesFormChanged: boolean;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  addressesFormValueObservable: Subscription;

  constructor(
    public translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authSer: AuthService,
    public userSer: UserService,
    private addressesSer: AddressesService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get the id of the edited address
    this.addressId = this.activeRoute.snapshot.paramMap.get('id');

    // get data of the edited address
    this.getEditedAddress();

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
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.addressesFormValueObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('edit-address-page.page-title'));
  }

  // get data of the edited address
  getEditedAddress() {
    this.mainLoadingSer.startLoading();

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined' && this.userSer.userInfo) {

      this.addressesSer.getEditedAddress(userId, this.addressId)
        .then(address => {
          const data: UserAddresses = address.data();

          this.addressesForm.patchValue({
            address: data.address,
            region: data.region,
            city: data.city,
            street: data.street,
            building: data.building,
            floor: data.floor,
            addressTitle: data.addressTitle,
            phoneNumber: data.fullPhoneNumber.replace(this.userSer.userInfo.country.dial, ''),
            additionalInfo: data.additionalInfo !== '-' ? data.additionalInfo : ''
          });

          // get and set the default values from the database
          this.addressesFormValue = JSON.stringify(this.addressesForm.getRawValue());

          // listening for changes in the default values to show save buttons
          this.onChanges();
          this.mainLoadingSer.endLoading();
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
        });

    } else {
      setTimeout(() => {
        this.getEditedAddress();
      }, 250);
    }
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.addressesFormValueObservable = this.addressesForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.addressesForm.getRawValue()) !== this.addressesFormValue) {
        this.addressesFormChanged = true;
      } else { this.addressesFormChanged = false; }
    });
  }

  // edit selected address on form submit
  editAddress(form: FormGroup) {
    const values = form.getRawValue();
    const newObject: UserAddresses = {
      addressTitle: values.addressTitle,
      address: values.address,
      region: values.region,
      city: values.city,
      street: values.street,
      building: values.building,
      floor: values.floor,
      fullPhoneNumber: `${this.userSer.userInfo.country.dial}${values.phoneNumber}`,
      additionalInfo: values.additionalInfo ? values.additionalInfo : '-'
    };

    // save new address on database
    this.mainLoadingSer.startLoading();
    this.addressesSer.editAddress(this.addressId, newObject)
      .then(() => {
        this.addressesFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.addressesFormChanged = false; // hide save buttons
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.changes-saved'), time: 5000});
        this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // redirect to parent
  redirectToParent() {
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
  }
}
