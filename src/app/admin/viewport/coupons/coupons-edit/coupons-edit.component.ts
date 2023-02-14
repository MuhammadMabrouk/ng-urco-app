import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CouponsService } from 'src/app/shared/services/admin/coupons.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Coupons } from 'src/app/shared/interfaces/admin/coupons';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-coupons-edit',
  templateUrl: './coupons-edit.component.html',
  styleUrls: ['./coupons-edit.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideToggle
  ]
})
export class CouponsEditComponent implements OnInit, OnDestroy {

  // edited coupon id
  couponId: string;

  // edited coupon form
  couponForm: FormGroup;
  // to store initial values
  couponFormValue;
  // to toggle visibility of save button
  couponFormChanged: boolean;

  // get today's date in nice format
  todayDate: string[] = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string).split('/');

  // date picker settings
  ExpDateOptions: IAngularMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    disableUntil: {
      year: +this.todayDate[2],
      month: +this.todayDate[1],
      day: +this.todayDate[0]
    },
    firstDayOfWeek: 'sa'
  };

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private couponsSer: CouponsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get the id of the edited coupon
    this.couponId = this.activeRoute.snapshot.paramMap.get('id');

    // get data of the edited coupon
    this.getEditedCoupon();

    // edited coupon form
    this.couponForm = this.fb.group({
      type: ['percent', [Validators.required]],
      amount: [null, [Validators.required]],
      usesLimit: [0, [Validators.required]],
      ExpDate: null
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('type', this.translateSer.instant('add-coupons-page.coupon-type-label')),
        this.validatorsSer.anyRequired('amount', this.translateSer.instant('add-coupons-page.amount-label'))
      ]
    });
  }

  get amount() { return this.couponForm.get('amount'); }
  get usesLimit() { return this.couponForm.get('usesLimit'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('edit-coupons-page.page-title'));
  }

  // get data of the edited coupon
  getEditedCoupon() {
    this.mainLoadingSer.startLoading();

    this.couponsSer.getEditedCoupon(this.couponId).then((coupon) => {
      const data: Coupons = coupon.data();

      // get the default values from the database
      const savedExpDate: IMyDateModel =
      data.ExpDate ? { isRange: false, singleDate: { date: data.ExpDate }, dateRange: null } : null;
      let amount;

      if (data.type === 'percent') {
        amount = data.amount * 100;
      } else if (data.type === 'fixed') {
        amount = data.amount;
      }

      this.couponForm.patchValue({
        type: data.type,
        amount,
        usesLimit: data.usesLimit,
        ExpDate: savedExpDate
      });

      // set the default values
      this.couponFormValue = JSON.stringify(this.couponForm.getRawValue());

      // listening for changes in the default values to show save buttons
      this.onChanges();

      this.mainLoadingSer.endLoading();
    });
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.couponForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.couponForm.getRawValue()) !== this.couponFormValue) {
        this.couponFormChanged = true;
      } else { this.couponFormChanged = false; }
    }));
  }

  // update amount & usesLimit controls
  updateValue(form: FormGroup, controlName: string, value: number) {
    form.patchValue({
      [controlName]: +value
    });
  }

  // edit selected coupon on form submit
  editCoupon(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    let amount;

    if (values.type === 'percent') {
      amount = values.amount / 100;
    } else if (values.type === 'fixed') {
      amount = values.amount;
    }

    const couponData: Coupons = {
      type: values.type,
      amount,
      ExpDate: values.ExpDate ? values.ExpDate.singleDate.date : null,
      usesLimit: values.usesLimit
    };

    // save new data of the coupon on database
    this.couponsSer.editCoupon(this.couponId, couponData)
      .then(() => {
        this.couponFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.couponFormChanged = false; // hide save button
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
