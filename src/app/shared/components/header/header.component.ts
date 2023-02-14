import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core'; // for translation
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { getCurrencySymbol } from '@angular/common';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { AdminGuardService } from 'src/app/shared/services/routes-guards/admin-guard.service';
import { UserGuardService } from 'src/app/shared/services/routes-guards/user-guard.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/shared/services/user/user.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { WishlistService } from 'src/app/shared/services/goods/wishlist.service';
import { CategoriesService } from 'src/app/shared/services/admin/categories.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { Subscription } from 'rxjs';
import { GeneralSettings } from 'src/app/shared/interfaces/admin/general-settings';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // create event for language change
  @Output() langChanged = new EventEmitter();

  // app languages
  langs: string[];
  // current language
  currentLang: string;

  // app currencies
  currenciesObj: object;
  currenciesArr: string[];
  // saved currency
  currentCurrency: string;

  isLoggedIn: boolean = false; // user login status
  userInfo: UserProfile; // here to store user info

  // to call unsubscribe safely (you don't know if is subscribed or not) just initialize the subscription with EMPTY instance.
  getCartLengthIfLoggedInObservable: Subscription = Subscription.EMPTY;
  getCartLengthIfLoggedOutObservable: Subscription = Subscription.EMPTY;
  getWishlistLengthIfLoggedInObservable: Subscription = Subscription.EMPTY;
  getWishlistLengthIfLoggedOutObservable: Subscription = Subscription.EMPTY;

  cartGoodsLength: number; // length of cart items
  navCartIconClass: boolean; // pulse effect class when length of cart items changes
  wishlistGoodsLength: number; // length of wishlist items
  navWishlistIconClass: boolean; // pulse effect class when length of wishlist items changes

  // categories in side menu
  categories: Category[];

  // store subscriptions for unsubscribe when component destroyed
  subscriptions: Subscription[] = [];

  constructor(
    private translate: TranslateService,
    private currencyExchangeSer: CurrencyExchangeService,
    public router: Router,
    private mainLoadingSer: MainLoadingService,
    private authSer: AuthService,
    private adminGuardSer: AdminGuardService,
    private userGuardSer: UserGuardService,
    private userSer: UserService,
    private storageSer: StorageService,
    private cartSer: CartService,
    private wishlistSer: WishlistService,
    private categoriesSer: CategoriesService,
    private generalSettingsSer: GeneralSettingsService
  ) {}

  ngOnInit() {
    // get app languages
    this.getAppLangs();

    // get currencies
    this.getCurrencies();

    // user info, cart & wishlist data
    this.userInfoAndCartWishlistData();

    // get general settings from the database in first open
    this.getGeneralSettingsInFirstOpen();

    // get categories data
    this.getCategories();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // get app languages
  getAppLangs() {
    // get current language
    this.currentLang = this.translate.currentLang;

    // get all languages
    this.langs = this.translate.getLangs();
  }

  // use this language
  useThisLang(lang: string) {
    this.translate.use(lang);

    // set new selected lang as the current lang
    this.currentLang = lang;

    // send selected lang on lang changed
    this.langChanged.emit(lang);
  }

  // get currencies
  getCurrencies() {
    // set current currency
    this.currentCurrency = localStorage.getItem('savedCurrency') || this.currencyExchangeSer.defaultCurrency;

    this.subscriptions.push(this.currencyExchangeSer.getCurrencies().subscribe(res => {

      // get currencies object to extract values from it
      this.currenciesObj = res;

      // get currencies as array to loop on them
      this.currenciesArr = Object.keys(res);

      // set process details in the service
      this.currencyExchangeSer.exchangeRates = {
        currency: this.currentCurrency,
        symbol: getCurrencySymbol(this.currentCurrency, 'narrow'),
        symbolString: this.currencyExchangeSer.symbols[this.currentCurrency],
        value: this.currenciesObj[this.currentCurrency]
      };
    }));
  }

  // use currency
  useThisCurrency(currency: string) {
    // set current currency
    this.currentCurrency = currency;
    localStorage.setItem('savedCurrency', currency);

    // set process details in the service
    this.currencyExchangeSer.exchangeRates = {
      currency,
      symbol: getCurrencySymbol(this.currentCurrency, 'narrow'),
      symbolString: this.currencyExchangeSer.symbols[this.currentCurrency],
      value: this.currenciesObj[currency]
    };
  }

  // user info, cart & wishlist data
  userInfoAndCartWishlistData() {
    this.mainLoadingSer.startLoading();

    // check if user is logged in
    this.authSer.user.subscribe(user => {

      const cartData = localStorage.getItem('cartData');
      const wishlistData = localStorage.getItem('wishlistData');

      if (user) {

        this.isLoggedIn = true;
        this.authSer.userId = user.uid;

        // get user info
        this.userSer.getUserInfo().then(data => {
          this.userInfo = this.userSer.userInfo = data;
        });

        // send cart from localStorage to database after sign in
        if (cartData) {
          this.cartSer.addToCartFromLocalStorage(JSON.parse(cartData));
        }

        // get length of cart items
        this.getCartLengthIfLoggedOutObservable.unsubscribe();
        this.getCartLengthIfLoggedInObservable = this.cartSer.getCartGoods(user.uid).subscribe(data => {
          this.cartGoodsLength = data.length;
          this.navCartIconClass = true;
          setTimeout(() => {
            this.navCartIconClass = false;
          }, 400);
        });

        // send wishlist from localStorage to database after sign in
        if (wishlistData) {
          this.wishlistSer.addToWishlistFromLocalStorage(JSON.parse(wishlistData));
        }

        // get length of wishlist items
        this.getWishlistLengthIfLoggedOutObservable.unsubscribe();
        this.getWishlistLengthIfLoggedInObservable = this.wishlistSer.getWishlistGoods(user.uid).subscribe(data => {
          this.wishlistGoodsLength = data.length;
          this.navWishlistIconClass = true;
          setTimeout(() => {
            this.navWishlistIconClass = false;
          }, 400);
        });
        this.mainLoadingSer.endLoading();
      } else {
        this.isLoggedIn = false;
        this.authSer.userId = null;
        this.userSer.userInfo = null;

        // get length of cart items
        this.getCartLengthIfLoggedInObservable.unsubscribe();
        this.getCartLengthIfLoggedOutObservable = this.storageSer.getItem('cartData').subscribe(data => {
          if (data) { this.cartGoodsLength = data.length; } else { this.cartGoodsLength = 0; }
          this.navCartIconClass = true;
          setTimeout(() => {
            this.navCartIconClass = false;
          }, 400);
        });

        // get length of wishlist items
        this.getWishlistLengthIfLoggedInObservable.unsubscribe();
        this.getWishlistLengthIfLoggedOutObservable = this.storageSer.getItem('wishlistData').subscribe(data => {
          if (data) { this.wishlistGoodsLength = data.length; } else { this.wishlistGoodsLength = 0; }
          this.navWishlistIconClass = true;
          setTimeout(() => {
            this.navWishlistIconClass = false;
          }, 400);
        });

        this.mainLoadingSer.endLoading();
      }

      this.authSer.isLoggedIn = this.isLoggedIn;
    });
  }

  // get general settings from the database in first open
  getGeneralSettingsInFirstOpen() {
    this.subscriptions.push(this.generalSettingsSer.getGeneralSettingsInFirstOpen().subscribe((res: GeneralSettings) => {
      this.generalSettingsSer.generalSettings = res;
    }));
  }

  // redirect to the 'sign-in' page with the 'returnUrl'
  navigateToSignIn() {
    const returnUrl = this.router.url;

    if (returnUrl.includes('sign-up')) {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: '/' }});
    } else {
      this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url }});
    }
  }

  // logOut
  logOut() {
    // tell the guard to go to the homepage after logout
    this.userGuardSer.redirectUrl = '/';
    this.adminGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }

  // get categories data
  getCategories() {
    this.mainLoadingSer.startLoading();

    this.categoriesSer.getCategories()
      .then((data) => {
        this.categories = data;
        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // show and hide sub menus in main side menu
  showSubMenu(el, menu) {
    $(menu).slideToggle();
    $(el.target).toggleClass('open');
  }
}
