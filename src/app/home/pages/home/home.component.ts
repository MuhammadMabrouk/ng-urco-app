import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { CategoriesService } from 'src/app/shared/services/admin/categories.service';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { MainOfferService } from 'src/app/shared/services/goods/main-offer.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { MainOffer } from 'src/app/shared/interfaces/goods/main-offer';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class HomeComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // categories in categories widget
  categories: Category[];

  // goods array for loop
  newArrivalsGoods: Goods[];
  featuredGoods: Goods[];

  // main offer data
  mainOfferData: MainOffer;
  // main offer good
  mainOfferGood: MainOffer;

  // class name to set bg color
  firstBannerClassesArr: string[] = ['primary-one-bg', 'primary-two-bg', 'primary-three-bg'];
  secondBannerClassesArr: string[] = ['primary-three-bg', 'primary-one-bg', 'primary-two-bg'];
  firstBannerClass: string;
  secondBannerClass: string;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private mainLoadingSer: MainLoadingService,
    public currencyExchangeSer: CurrencyExchangeService,
    public authSer: AuthService,
    private categoriesSer: CategoriesService,
    private goodsSer: GoodsService,
    private mainOfferSer: MainOfferService,
    private globalJs: GlobalJsFunctionsService
  ) {}

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get categories data
    this.getCategories();

    // get new arrivals goods data
    this.getNewArrivalsGoods();

    // get featured goods data
    this.getFeaturedGoods();

    // get the good data of the main offer
    this.getMainOfferData();

    // change banner class to change its bg color
    this.changeBannerClass();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('home-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  trackGoods(index: number, goods: Goods) {
    return goods ? goods.id : undefined;
  }

  // for ngFor trackBy
  trackCategories(index: number, categories: Category) {
    return categories ? categories.catSlug : undefined;
  }

  // get categories data
  getCategories() {
    this.mainLoadingSer.startLoading();

    this.categoriesSer.getCategories()
      .then(data => {
        this.categories = data;
        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // get new arrivals goods data
  getNewArrivalsGoods() {
    this.mainLoadingSer.startLoading();

    // get goods data
    this.subscriptions.push(this.goodsSer.getNewArrivalsGoods().subscribe(data => {

      this.newArrivalsGoods = data.map(el => {
        return {
          id: el.payload.doc.id,
          ...el.payload.doc.data() as Goods
        };
      });

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));
  }

  // get featured goods data
  getFeaturedGoods() {
    this.mainLoadingSer.startLoading();

    // get goods data
    this.subscriptions.push(this.goodsSer.getFeaturedGoods().subscribe(data => {

      this.featuredGoods = data.map(el => {
        return {
          id: el.payload.doc.id,
          ...el.payload.doc.data() as Goods
        };
      });

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));
  }

  // get the good data of the main offer
  getMainOfferData() {
    this.mainLoadingSer.startLoading();

    // get data of the main offer
    this.mainOfferSer.getMainOfferData()
      .then(dataDoc => {
        this.mainOfferData = dataDoc.data();

        // get the main offer good
        this.mainOfferSer.getMainOfferGood(dataDoc.data().id)
          .then(goodDoc => {
            this.mainOfferGood = goodDoc.data();
            this.mainLoadingSer.endLoading();
          })
          .catch(() => this.mainLoadingSer.endLoading());
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // change banner class to change its bg color
  changeBannerClass() {
    this.firstBannerClass = this.globalJs.changeClassEveryLoad('firstBannerClass', this.firstBannerClassesArr);
    this.secondBannerClass = this.globalJs.changeClassEveryLoad('secondBannerClass', this.secondBannerClassesArr);
  }
}
