import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
// library for validation and formatting of credit card data
import { CreditCardValidators } from 'angular-cc-library';
// library to find out the type of credit card
import creditCardType, { getTypeInfo, types as CardType } from 'credit-card-type';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { PaymentsService } from 'src/app/shared/services/user/payments.service';
import { UserPayments } from 'src/app/shared/interfaces/user/user-payments';
import { CreditCardType } from 'src/app/shared/interfaces/credit-card-type';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-payments-edit',
  templateUrl: './payments-edit.component.html',
  styleUrls: ['./payments-edit.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    slideToggle
  ]
})
export class PaymentsEditComponent implements OnInit, OnDestroy {

  methodId: string; // edited payment method id

  paymentMethodForm: FormGroup; // edit payment method form
  paymentMethodFormValue; // to store initial values
  // to toggle visibility of save button
  paymentMethodFormChanged: boolean;

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
    private authSer: AuthService,
    private paymentsSer: PaymentsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get the id of the edited payment method
    this.methodId = this.activeRoute.snapshot.paramMap.get('id');

    // get data of the edited payment method
    this.getEditedPaymentMethod();

    // payment method form
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
    this.title.setTitle(this.translateSer.instant('edit-payments-page.page-title'));
  }

  // get data of the edited payment method
  getEditedPaymentMethod() {
    this.mainLoadingSer.startLoading();

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined') {

      this.paymentsSer.getEditedPaymentMethod(userId, this.methodId)
        .then(method => {
          const data: UserPayments = method.data();

          this.paymentMethodForm.patchValue({
            cardNumber: data.cardNumber,
            ExpDate: data.ExpDate,
            securityCode: data.securityCode
          });
          this.cardType = data.type;
          this.typeImgPath = `../../../assets/images/icons/checkout/card-type/${data.type}.png`;

          // get and set the default values from the database
          this.paymentMethodFormValue = JSON.stringify(this.paymentMethodForm.getRawValue());

          // listening for changes in the default values to show save buttons
          this.onChanges();
          this.mainLoadingSer.endLoading();
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
        });

    } else {
      setTimeout(() => {
        this.getEditedPaymentMethod();
      }, 250);
    }
  }

  // listening for changes to show save buttons
  onChanges(): void {
    this.subscriptions.push(this.paymentMethodForm.valueChanges.subscribe(() => {
      const formValues = this.paymentMethodForm.getRawValue();
      const newValues = {
        cardNumber: formValues.cardNumber.replace(/\s/g, ''),
        ExpDate: formValues.ExpDate,
        securityCode: formValues.securityCode
      };

      if (JSON.stringify(newValues) !== this.paymentMethodFormValue) {
        this.paymentMethodFormChanged = true;
      } else { this.paymentMethodFormChanged = false; }
    }));
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

  // edit selected payment method on form submit
  editPaymentMethod(form: FormGroup) {
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

    // save new data of the method on database
    this.mainLoadingSer.startLoading();
    this.paymentsSer.editPaymentMethod(this.methodId, methodData)
      .then(() => {
        this.paymentMethodFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.paymentMethodFormChanged = false; // hide save buttons
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
