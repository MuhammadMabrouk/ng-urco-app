import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// library for validation and formatting of credit card data
import { CreditCardValidators } from 'angular-cc-library';
// library to find out the type of credit card
import creditCardType, { getTypeInfo, types as CardType } from 'credit-card-type';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentsService } from 'src/app/shared/services/user/payments.service';
import { CreditCardType } from 'src/app/shared/interfaces/credit-card-type';
import { UserPayments } from 'src/app/shared/interfaces/user/user-payments';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-payments-add',
  templateUrl: './payments-add.component.html',
  styleUrls: ['./payments-add.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class PaymentsAddComponent implements OnInit, OnDestroy {

  // new payment method form
  paymentMethodForm: FormGroup;

  // get card info from it's number
  cardType: string;
  typeImgPath: string;
  securityCodeName: string = 'Security Code';
  securityCodeSize: number;
  securityCodePlaceholder: string = '3- or 4-digit code';

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

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
    private paymentsSer: PaymentsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // new payment method form
    this.paymentMethodForm = this.fb.group({
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

    // listen for card number changes
    this.listenForCardNumberChanges();
  }

  get cardNumber() { return this.paymentMethodForm.get('cardNumber'); }
  get ExpDate() { return this.paymentMethodForm.get('ExpDate'); }
  get securityCode() { return this.paymentMethodForm.get('securityCode'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('add-payments-page.page-title'));
  }

  // listening for changes in card number
  listenForCardNumberChanges() {
    this.subscriptions.push(this.cardNumber.valueChanges.subscribe(value => {
      // get credit card info from its number
      const creditCards: CreditCardType[] = creditCardType(value);

      this.cardType = value && creditCards.length !== 0 ? creditCards[0].type : '';
      this.typeImgPath = value && creditCards.length !== 0 ? `../../../assets/images/icons/checkout/card-type/${creditCards[0].type}.png` : '';
      this.securityCodeName = value && creditCards.length !== 0 ? creditCards[0].code.name : 'CVV';
      this.securityCodeSize = value && creditCards.length !== 0 ? creditCards[0].code.size : undefined;
      this.securityCodePlaceholder = value && creditCards.length !== 0 ? `${creditCards[0].code.size}-digit code` : '3- or 4-digit code';
    }));
  }

  // save new payment method on form submit
  saveNewMethod(form: FormGroup) {
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

    // save new payment method on database
    this.mainLoadingSer.startLoading();
    this.paymentsSer.addNewPaymentMethod(methodData)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.card-saved'), time: 5000});
        form.reset();
        this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.failed-card-exist'), time: 5000});
      });
  }

  // redirect to parent
  redirectToParent() {
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });
  }
}
