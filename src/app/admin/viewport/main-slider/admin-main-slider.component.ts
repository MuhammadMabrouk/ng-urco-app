import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsValidatorsService } from 'src/app/shared/services/forms-validators.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { MainSliderService } from 'src/app/shared/services/goods/main-slider.service';
import { MainSlider } from 'src/app/shared/interfaces/goods/main-slider';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-main-slider',
  templateUrl: './admin-main-slider.component.html',
  styleUrls: ['./admin-main-slider.component.scss']
})
export class AdminMainSliderComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // new good form
  newGoodForm: FormGroup;

  // goods array for loop
  goods: Goods[];

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    public currencyExchangeSer: CurrencyExchangeService,
    private fb: FormBuilder,
    private validatorsSer: FormsValidatorsService,
    private mainSliderSer: MainSliderService
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
      goodId: [null, Validators.required]
    }, {
      validator: [
        // required validation
        this.validatorsSer.anyRequired('goodId', this.translateSer.instant('main-slider-page.good-id-field-title'))
      ]
    });

    // get the goods data of the main slider
    this.getMainSliderGoodsData();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('main-slider-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: Goods) {
    return good ? good.id : undefined;
  }

  // get the goods data of the main slider
  getMainSliderGoodsData() {
    this.mainLoadingSer.startLoading();

    this.mainSliderSer.getMainSliderGoodsData()
      .then(goods => {
        this.goods = goods;
        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // save new good on form submit
  saveNewGood(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const data: MainSlider = {
      id: form.getRawValue().goodId,
      seqNo: Date.now()
    };

    // save new good on database
    this.mainSliderSer.addNewGood(data)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-saved'), time: 5000});
        form.reset();
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
      this.mainSliderSer.deleteGood(id)
        .then(() => {
          // delete this item from the view
          this.deleteItemFromView(id, this.goods);

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-removed'), time: 5000});
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

  // delete this item from the view
  deleteItemFromView(id: string, goods: Goods[]) {
    // get the selected item
    const selectedItem = goods.filter(item => item.id === id);

    // remove the selected item
    for (let i = 0; i < goods.length; i++) {
      if (goods[i].id === selectedItem[0].id) {
        goods.splice(i, 1);
      }
    }
  }
}
