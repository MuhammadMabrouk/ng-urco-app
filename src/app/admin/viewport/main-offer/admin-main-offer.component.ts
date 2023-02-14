import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { MainOfferService } from 'src/app/shared/services/goods/main-offer.service';
import { MainOffer } from 'src/app/shared/interfaces/goods/main-offer';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-main-offer',
  templateUrl: './admin-main-offer.component.html',
  styleUrls: ['./admin-main-offer.component.scss']
})
export class AdminMainOfferComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // new good form
  newGoodForm: FormGroup;
  // to store initial values
  newGoodFormValue;
  // to toggle visibility of save button
  newGoodFormChanged: boolean;

  // main offer good
  mainOfferGood: Goods;

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
    private mainOfferSer: MainOfferService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['admin']);
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // new good form
    this.newGoodForm = this.fb.group({
      goodId: [null, Validators.required],
      type: ['percent', Validators.required],
      amount: [null, Validators.required]
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('goodId', this.translateSer.instant('main-offer-page.good-id-field-title')),
        this.validatorsSer.anyRequired('type', this.translateSer.instant('main-offer-page.discount-type-label')),
        this.validatorsSer.anyRequired('amount', this.translateSer.instant('main-offer-page.discount-amount-label'))
      ]
    });

    // get data of the main offer
    this.getMainOfferData();
  }

  get type() { return this.newGoodForm.get('type'); }
  get amount() { return this.newGoodForm.get('amount'); }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('main-offer-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // get data of the main offer
  getMainOfferData() {
    this.mainLoadingSer.startLoading();

    this.subscriptions.push(this.mainOfferSer.getMainOfferDataAsObservable().subscribe(data => {
      if (data) {
        // get the default values from the database
        let amount;

        if (data.type === 'percent') {
          amount = data.amount * 100;
        } else if (data.type === 'fixed') {
          amount = data.amount;
        }

        this.newGoodForm.patchValue({
          goodId: data.id,
          type: data.type,
          amount
        });

        // set the default values
        this.newGoodFormValue = JSON.stringify(this.newGoodForm.getRawValue());

        // listening for changes in the default values to enable save button
        this.onChanges();

        // get the main offer good
        this.mainOfferSer.getMainOfferGood(data.id)
          .then(doc => {
            this.mainOfferGood = doc.data();
            this.mainLoadingSer.endLoading();
          })
          .catch(() => this.mainLoadingSer.endLoading());
      }

      // listening for changes in the default values to enable save button
      this.onChanges();

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));
  }

  // listening for changes to enable save button
  onChanges(): void {
    this.subscriptions.push(this.newGoodForm.valueChanges.subscribe(() => {
      if (JSON.stringify(this.newGoodForm.getRawValue()) !== this.newGoodFormValue) {
        this.newGoodFormChanged = true;
      } else { this.newGoodFormChanged = false; }
    }));
  }

  // update discount amount control
  updateDiscountAmount(form: FormGroup, value: number) {
    form.patchValue({ amount: +value });
  }

  // save new good on form submit
  saveNewGood(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const values = form.getRawValue();
    let amount;

    if (values.type === 'percent') {
      amount = values.amount / 100;
    } else if (values.type === 'fixed') {
      amount = values.amount;
    }

    const data: MainOffer = {
      id: values.goodId,
      type: values.type,
      amount
    };

    // save new good on database
    this.mainOfferSer.addNewGood(data)
      .then(() => {
        this.newGoodFormValue = JSON.stringify(form.getRawValue()); // get and set the new values
        this.newGoodFormChanged = false; // disable save button
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-saved'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // delete the good
  deleteGood(id: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-item'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // delete the good
      this.mainOfferSer.deleteGood(id)
        .then(() => {
          // delete this item from the view
          this.mainOfferGood = undefined;

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-removed'), time: 5000});
          this.newGoodForm.reset();
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({
            class: 'danger',
            msg: this.translateSer.instant('toast-notifications.oops-something-wrong'),
            time: 5000
          });
        });
    }
  }
}
