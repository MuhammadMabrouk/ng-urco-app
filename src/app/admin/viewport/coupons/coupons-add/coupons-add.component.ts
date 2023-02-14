import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IAngularMyDpOptions } from 'angular-mydatepicker';
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

@Component({
  selector: 'app-coupons-add',
  templateUrl: './coupons-add.component.html',
  styleUrls: ['./coupons-add.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class CouponsAddComponent implements OnInit, OnDestroy {

  // new coupon form
  couponForm: FormGroup;

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

    // new coupon form
    this.couponForm = this.fb.group({
      type: ['percent', Validators.required],
      amount: [null, Validators.required],
      usesLimit: [0, Validators.required],
      ExpDate: null
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('type', this.translateSer.instant('add-coupons-page.coupon-type-label')),
        this.validatorsSer.anyRequired('amount', this.translateSer.instant('add-coupons-page.amount-label'))
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
    this.title.setTitle(this.translateSer.instant('add-coupons-page.page-title'));
  }

  // update amount & usesLimit controls
  updateValue(form: FormGroup, controlName: string, value: number) {
    form.patchValue({
      [controlName]: +value
    });
  }

  // save new coupon on form submit
  saveNewCoupon(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    let amount;

    if (values.type === 'percent') {
      amount = values.amount / 100;
    } else if (values.type === 'fixed') {
      amount = values.amount;
    }

    const couponData: Coupons = {
      seqNo: Date.now(),
      type: values.type,
      amount,
      ExpDate: values.ExpDate ? values.ExpDate.singleDate.date : null,
      usesLimit: values.usesLimit,
      usesNo: 0,
      enabled: true
    };

    // save new coupon on database
    this.couponsSer.addNewCoupon(couponData)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.coupon-saved'), time: 5000});
        form.reset();
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
