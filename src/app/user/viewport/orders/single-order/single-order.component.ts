import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { OrdersService } from 'src/app/shared/services/user/orders.service';
import { ReturnsService } from 'src/app/shared/services/user/returns.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserOrders } from 'src/app/shared/interfaces/user/user-orders';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class SingleOrderComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // this order data
  thisOrder: UserOrders;
  // order goods array for loop
  orderGoods: Goods[];
  // viewed order id
  orderId: string;

  // flag to toggle the modal of good rating
  reviewModal: boolean = false;

  // flag to toggle the modal of return reason
  returnModal: boolean = false;
  // return reason form
  returnReasonForm: FormGroup;
  // return reason form controls validators
  commentsMinLength: number = 100;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    public currencyExchangeSer: CurrencyExchangeService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private authSer: AuthService,
    private ordersSer: OrdersService,
    private returnsSer: ReturnsService,
    private userSer: UserService,
    private activeRoute: ActivatedRoute,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['user', 'order']);

    // get the id of the viewed order
    this.orderId = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get this order data
    this.getSingleOrder();

    // get single order data
    this.getSingleOrderContent();

    // return reason form
    this.returnReasonForm = this.fb.group({
      good: [null, Validators.required],
      reasons: this.fb.group({
        accidentalOrder: false,
        betterPriceAvailable: false,
        poorQualityOrFaulty: false,
        arrivedTooLate: false,
        wrongItemWasSent: false,
        looksDifferentFromImages: false,
        descriptionWasNotAccurate: false,
        noLongerNeeded: false
      }),
      comments: [null, Validators.minLength(this.commentsMinLength)]
    }, {
      validator: [
        // checkboxes min required validation
        this.validatorsSer.checkboxesMinRequired('reasons', 1),
        // comments minlength validation
        this.validatorsSer.anyMinLength(
          'comments',
          this.translateSer.instant('single-order-page.return-modal.comments.your-comment'),
          this.commentsMinLength
        )
      ]
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('single-order-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: Goods) {
    return good ? good.id : undefined;
  }

  // get this order data
  getSingleOrder() {
    this.mainLoadingSer.startLoading();

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined') {

      this.ordersSer.getSingleOrder(userId, this.orderId)
      .then(order => {
        this.thisOrder = order.data();
        this.mainLoadingSer.endLoading();
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
      });

    } else {
      setTimeout(() => {
        this.getSingleOrder();
      }, 250);
    }
  }

  // get single order content data
  getSingleOrderContent() {
    this.mainLoadingSer.startLoading();

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined') {

      // get all goods in the order
      this.subscriptions.push(this.ordersSer.getSingleOrderContent(userId, this.orderId).subscribe(goods => {
        this.orderGoods = goods;
        this.mainLoadingSer.endLoading();

      }, () => this.mainLoadingSer.endLoading()));

    } else {
      setTimeout(() => {
        this.getSingleOrderContent();
      }, 250);
    }
  }

  // remove this good from the order
  removeGood(goodId: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-product'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      this.ordersSer.removeGoodFromOrder(this.orderId, goodId)
        .then(() => { this.mainLoadingSer.endLoading(); })
        .catch(() => { this.mainLoadingSer.endLoading(); });
    }
  }

  // show the review modal for this good
  productReview() {
    this.reviewModal = true; // open the modal
  }

  // cancel review
  cancelReview() {
    this.reviewModal = false; // close the modal
  }

  // compare the number of days after ordering with the number of days for the return period
  isInReturnPeriod(deliveredDate: string) {
    const tDate = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string).split('/');
    const dDate = deliveredDate.split('/');
    const tDateObj = { day: +tDate[0], month: +tDate[1], year: +tDate[2] };
    const dDateObj = { day: +dDate[0], month: +dDate[1], year: +dDate[2] };
    // get the number of days after ordering
    const daysNumber = this.globalJs.calcDaysBetweenDates(tDateObj, dDateObj);

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      return daysNumber <= this.generalSettingsSer.generalSettings.returnPeriod && daysNumber >= 0;

    } else {
      setTimeout(() => {
        this.isInReturnPeriod(deliveredDate);
      }, 250);
    }
  }

  // show the return modal for this good
  productReturn(good: Goods) {
    // set the good data in returnReason form values
    this.returnReasonForm.patchValue({ good });

    this.returnModal = true; // open the modal
  }

  // cancel returning
  cancelReturning() {
    this.returnModal = false; // close the modal
    this.returnReasonForm.reset();
  }

  // send request to return this good
  submitReturnRequest(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const reasons = [];
    const reasonsObj = form.getRawValue().reasons;
    const reasonsArr = Object.keys(reasonsObj).filter(key => reasonsObj[key]);
    reasonsArr.forEach(str => {
      reasons.push(str.replace(/([A-Z])/g, ' $1').toLowerCase());
    });

    const good = form.getRawValue().good;
    const comments = form.getRawValue().comments;

    // get user info
    this.userSer.getUserInfo()
      .then(res => {
        const returnDetails = { userInfo: res, good, reasons, comments };

        // send request to return this good
        this.returnsSer.returnGood(this.orderId, this.thisOrder, returnDetails)
          .then(() => {
            // mark the whole order as returned if all goods inside it is returned
            this.returnsSer.markOrderAsReturned(this.orderId);
            this.returnModal = false; // close the modal
            form.reset();

            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({
              class: 'success',
              msg: this.translateSer.instant('toast-notifications.returning-in-progress'),
              time: 5000
            });
          });
      });
  }
}
