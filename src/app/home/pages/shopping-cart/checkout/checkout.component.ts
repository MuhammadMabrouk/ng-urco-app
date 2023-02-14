import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// library for validation and formatting of credit card data
import { CreditCardValidators } from 'angular-cc-library';
// library to find out the type of credit card
import creditCardType, { getTypeInfo, types as CardType } from 'credit-card-type';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { CreditCardType } from 'src/app/shared/interfaces/credit-card-type';
import { CouponsService } from 'src/app/shared/services/admin/coupons.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { AddressesService } from 'src/app/shared/services/user/addresses.service';
import { PaymentsService } from 'src/app/shared/services/user/payments.service';
import { OrdersService } from 'src/app/shared/services/user/orders.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { SelectMenu } from 'src/app/shared/ui-elements/forms/select-menu/select-menu';
import { UserPayments } from 'src/app/shared/interfaces/user/user-payments';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  animations: [
    fadeInUp,
    fadeInUpStaggerEnter
  ]
})
export class CheckoutComponent implements OnInit, OnDestroy {

  // get addresses for shipping address select menu
  addresses: SelectMenu[];
  shippingAddress: string;

  // get payment methods for credit cards select menu
  paymentMethods: SelectMenu[];

  // credit card form
  creditCardForm: FormGroup;

  // get card info from it's number
  cardType: string;
  typeImgPath: string;
  securityCodeName: string = 'Security Code';
  securityCodeSize: number;
  securityCodePlaceholder: string = '3- or 4-digit code';

  // promotion code form
  promotionForm: FormGroup;

  // values in summery side bar
  subtotal: number = 0;
  total: number = 0;
  promoCode: string;
  promoAmount: number = 0;
  promoType: string = 'fixed';

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
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authSer: AuthService,
    private couponsSer: CouponsService,
    private addressesSer: AddressesService,
    private paymentsSer: PaymentsService,
    private ordersSer: OrdersService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1);

    // get the total from current url
    this.subtotal = +this.activeRoute.snapshot.paramMap.get('total');
    this.total = this.subtotal;
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get addresses data
    this.getAddresses();

    // get payment methods data
    this.getPaymentMethods();

    // credit card form
    this.creditCardForm = this.fb.group({
      cardNumber: [null, [CreditCardValidators.validateCCNumber as any]],
      ExpDate: [null, [CreditCardValidators.validateExpDate as any]],
      securityCode: [null, [
        Validators.required as any,
        Validators.minLength(3) as any,
        Validators.maxLength(4) as any
      ]]
    }, {
      validator: [
        // card number format validation
        this.validatorsSer.creditCardNumberFormat('cardNumber'),
        // expiration date format validation
        this.validatorsSer.dateFormat('ExpDate'),
        // security code minlength validation
        this.validatorsSer.anyMinLength('securityCode', this.translateSer.instant('add-payments-page.security-code'), 3),
        // security code maxlength validation
        this.validatorsSer.anyMaxLength('securityCode', this.translateSer.instant('add-payments-page.security-code'), 4)
      ]
    });

    // promotion code form
    this.promotionForm = this.fb.group({
      promotionCode: [null, Validators.required]
    }, {
      validator: [
        // promotionCode required validation
        this.validatorsSer.anyRequired(
          'promotionCode',
          this.translateSer.instant('checkout-page.side-box.promotion-form.promo-placeholder')
        )
      ]
    });

    // listen for card number changes
    this.listenForCardNumberChanges();
  }

  get cardNumber() { return this.creditCardForm.get('cardNumber'); }
  get ExpDate() { return this.creditCardForm.get('ExpDate'); }
  get securityCode() { return this.creditCardForm.get('securityCode'); }
  get promotionCode() { return this.promotionForm.get('promotionCode'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('checkout-page.page-title'));
  }

  // get addresses data
  getAddresses() {
    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined') {

      // get addresses data
      this.addressesSer.getAddresses(userId).then(addresses => {
        this.addresses = addresses.map(address => {
          return {
            id: address.addressTitle.toLowerCase(),
            label: address.addressTitle
          };
        });
      });

    } else {
      setTimeout(() => {
        this.getAddresses();
      }, 250);
    }
  }

  // get address value
  shippingAddressChanged(option: SelectMenu) {
    this.shippingAddress = option.label;
  }

  // get payment methods data
  getPaymentMethods() {
    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined') {

      // get payment methods data
      this.paymentsSer.getPaymentMethods(userId).then(methods => {
        this.paymentMethods = methods.map((method, index: number) => {
          return {
            id: `method-${index + 1}`,
            icon: `../../../assets/images/icons/checkout/card-type/${method.type}.png`,
            label: this.globalJs.stringMask(method.cardNumber, 4),
            cardNumber: method.cardNumber,
            ExpDate: method.ExpDate,
            securityCode: method.securityCode
          };
        });
      });

    } else {
      setTimeout(() => {
        this.getPaymentMethods();
      }, 250);
    }
  }

  // get credit card value
  selectCardChanged(option: UserPayments) {
    this.creditCardForm.patchValue({
      cardNumber: option.cardNumber,
      ExpDate: option.ExpDate,
      securityCode: option.securityCode
    });
  }

  // listening for changes in card number
  listenForCardNumberChanges() {
    this.subscriptions.push(this.cardNumber.valueChanges.subscribe(value => {
      const creditCards: CreditCardType[] = creditCardType(value);

      this.cardType = value && creditCards.length !== 0 ? creditCards[0].type : '';
      this.typeImgPath = value && creditCards.length !== 0 ? `../../../assets/images/icons/checkout/card-type/${creditCards[0].type}.png` : '';
      this.securityCodeName = value && creditCards.length !== 0 ? creditCards[0].code.name : 'CVV';
      this.securityCodeSize = value && creditCards.length !== 0 ? creditCards[0].code.size : undefined;
      this.securityCodePlaceholder = value && creditCards.length !== 0 ? `${creditCards[0].code.size}-digit code` : '3- or 4-digit code';
    }));
  }

  // apply promotion code discount on submit
  applyDiscount(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const code = form.value.promotionCode;
    this.promoCode = code;

    this.couponsSer.applyCouponDiscount(code)
      .then(coupon => {

        this.promoAmount = coupon.amount;
        this.promoType = coupon.type;

        // get the total amount of the goods
        let sumTotal: number;

        if (this.promoType === 'fixed') { sumTotal = this.subtotal - this.promoAmount;
        } else if (this.promoType === 'percent') { sumTotal = this.subtotal - (this.subtotal * this.promoAmount); }

        this.total = sumTotal >= 0 ? sumTotal : 0;

        form.reset();
        this.mainLoadingSer.endLoading();
      }).catch(() => {
        // if the user entered a valid code and then returned and entered an invalid code, cancel the discount
        this.promoAmount = 0;
        this.promoType = 'fixed';
        this.total = this.subtotal;

        this.notifySer.setNotify({
          class: 'danger',
          msg: `${this.translateSer.instant('toast-notifications.coupon-code')} ${code} ${this.translateSer.instant('toast-notifications.is-invalid')}`,
          time: 5000
        });
        this.mainLoadingSer.endLoading();
      });
  }

  // payment
  payment() {
    // get & set address value
    let address: string;

    // if the user select an address get its value
    if (this.shippingAddress) {
      address = this.shippingAddress;

      // if the user doesn't select an address get the first address value
    } else if (this.addresses.length) {
      address = this.addresses[0].label;

      // if the user doesn't enter an address at all, set it to an empty value
    } else {
      address = '';
    }

    // allow payment if the address is selected or show alert message if not
    if (address) {
      this.mainLoadingSer.startLoading();

      this.ordersSer.addNewOrder(address, this.subtotal - this.generalSettingsSer.generalSettings.shippingCost)
        .then(() => {
          // calc the number of uses for this coupon
          if (this.promoAmount > 0) {
            this.couponsSer.calcCouponUsesNo(this.promoCode);
          }

          // go to the confirmation page after payment
          this.router.navigate(['confirmation'], { relativeTo: this.activeRoute.parent });

          this.mainLoadingSer.endLoading();
        })
        .catch(() => this.mainLoadingSer.endLoading());
    } else {
      this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.add-shipping-address'), time: 5000});
    }
  }

  // pay by credit card
  payByCreditCard(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    // save new credit card on form submit
    const values = form.getRawValue();
    // get credit card info from its number
    const creditCards: CreditCardType[] = creditCardType(values.cardNumber);

    const methodData: UserPayments = {
      seqNo: Date.now(),
      cardNumber: values.cardNumber,
      ExpDate: values.ExpDate,
      securityCode: values.securityCode,
      niceType: creditCards[0].niceType,
      type: creditCards[0].type
    };

    // save new credit card info on database
    this.paymentsSer.addNewPaymentMethod(methodData)
      .then(() => {
        // make payment
        this.payment();

        this.mainLoadingSer.endLoading();
        form.reset();
      })
      .catch(() => {
        // make payment
        this.payment();
        this.mainLoadingSer.endLoading();
      });
  }

  // pay by paypal
  payByPayPal() {
    console.log('Pay by PayPal');
    this.payment();
  }

  // pay cash
  payCash() {
    console.log('Pay Cash');
    this.payment();
  }

  // payment methods tabs
  paymentMethodsTabs(thisEl, contentToShow) {
    $(thisEl.currentTarget).addClass('active').siblings('li').removeClass('active');
    $(contentToShow).fadeIn().siblings('.content').hide();
  }
}
