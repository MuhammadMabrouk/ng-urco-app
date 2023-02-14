import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { Router } from '@angular/router';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';
import { slideFadeUpRedHighlightState } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade-up-red-highlight';

@Component({
  selector: 'app-cart-view',
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
  animations: [
    fadeInUp,
    fadeInUpStaggerBind,
    slideFadeUpRedHighlightState
  ]
})
export class CartViewComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  isLoggedIn: boolean = false; // user login status

  cartGoods: Goods[];
  subtotal = 0;

  // animation states
  animationStates: string[];

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  isUserObservable: Subscription = Subscription.EMPTY;
  deleteCartItemIfLoggedOutObservable: Subscription = Subscription.EMPTY;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    public currencyExchangeSer: CurrencyExchangeService,
    private router: Router,
    private authSer: AuthService,
    private cartSer: CartService,
    private storageSer: StorageService,
    public generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get cart goods data
    this.getCartGoods();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.isUserObservable.unsubscribe();
    this.deleteCartItemIfLoggedOutObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('shopping-cart-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: Goods) {
    return good ? good.id : undefined;
  }

  // get cart goods data
  getCartGoods() {
    this.mainLoadingSer.startLoading();

    this.isUserObservable = this.authSer.user.subscribe(user => {

      if (user) {

        this.isLoggedIn = true;
        this.deleteCartItemIfLoggedOutObservable.unsubscribe();

      } else { this.isLoggedIn = false; }

      this.cartSer.getCartGoodsData()
        .then((goods: Cart[]) => {

          this.cartGoods = goods;

          // create array of states
          this.animationStates = goods.map(() => 'in');

          // calculate the total amount of the cart goods
          this.sumSubtotal(this.cartGoods);

          this.mainLoadingSer.endLoading();
        })
        .catch(() => this.mainLoadingSer.endLoading());
    });
  }

  // calculate the total amount of the cart goods
  sumSubtotal(arr: Goods[]) {
    this.subtotal = 0;

    // tslint:disable-next-line: forin
    for (const i in arr) {
      this.subtotal += arr[i].priceAfterDiscount * arr[i].qty;
    }
  }

  // delete selected item from cart
  deleteCartItem(id: string, index: number) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-product'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      if (this.isLoggedIn) {

        this.cartSer.deleteCartItem(id)
          .then(() => {
            // change animation states
            this.changeAnimationStates(index);

            // reducing the deleted good price from the subtotal
            this.subtotal -= this.cartGoods[index].priceAfterDiscount * this.cartGoods[index].qty;

            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.item-deleted'), time: 5000});
          })
          .catch(() => {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({
              class: 'danger',
              msg: this.translateSer.instant('toast-notifications.oops-something-wrong'),
              time: 5000
            });
          });

      } else {

        const cartGoods: Cart[] = JSON.parse(localStorage.getItem('cartData'));

        // sort the array by the sequential number
        cartGoods.sort((a, b) => a.seqNo - b.seqNo).reverse();

        // delete selected item from cart
        cartGoods.splice(index, 1);

        this.deleteCartItemIfLoggedOutObservable = this.storageSer.setItem('cartData', cartGoods).subscribe();

        // change animation states
        this.changeAnimationStates(index);

        // reducing the deleted good price from the subtotal
        this.subtotal -= this.cartGoods[index].priceAfterDiscount * this.cartGoods[index].qty;

        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({ class: 'success', msg: this.translateSer.instant('toast-notifications.item-deleted'), time: 5000 });
      }
    }
  }

  // change animation states
  changeAnimationStates(index: number) {
    // change animation states
    this.animationStates[index] = (this.animationStates[index] === 'in') ? 'out' : '';

    setTimeout(() => {
      // remove selected item from the dom
      this.cartGoods.splice(index, 1);

      // remove selected item's state
      this.animationStates.splice(index, 1);
    }, 800);
  }

  // update qty value when the user changes it
  updateQty(good: Cart, newValue: number) {
    this.mainLoadingSer.startLoading();

    if (this.isLoggedIn) {

      // get selected good & it's qty value to use optimistic technic
      const selectedGoodIndex = this.cartGoods.findIndex(goodItem => goodItem.id === good.id);
      const oldValue = this.cartGoods[selectedGoodIndex].qty;
      this.cartGoods[selectedGoodIndex].qty = +newValue;

      this.cartSer.updateQty(good.id, +newValue)
        .then(() => {
          this.sumSubtotal(this.cartGoods);

          this.mainLoadingSer.endLoading();
        })
        .catch(() => {
          // roll back qty changes
          this.cartGoods[selectedGoodIndex].qty = oldValue;

          this.mainLoadingSer.endLoading();
        });

    } else {

      const cartGoods: Cart[] = JSON.parse(localStorage.getItem('cartData'));

      // sort the array by the sequential number
      cartGoods.sort((a, b) => a.seqNo - b.seqNo).reverse();

      const selectedGoodIndex = cartGoods.findIndex(goodItem => goodItem.id === good.id);

      const data: Cart = {
        id: cartGoods[selectedGoodIndex].id,
        seqNo: cartGoods[selectedGoodIndex].seqNo,
        qty: +newValue
      };

      cartGoods[selectedGoodIndex] = data;
      this.cartGoods[selectedGoodIndex].qty = data.qty;
      this.deleteCartItemIfLoggedOutObservable = this.storageSer.setItem('cartData', cartGoods).subscribe();

      // calculate the total amount of the cart goods
      this.sumSubtotal(this.cartGoods);

      this.mainLoadingSer.endLoading();
    }
  }

  // redirect to the 'sign-in' page
  signInToCheckout() {
    // redirect to the 'sign-in' page with the 'returnUrl'
    this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url }});

    // show an alert that tells the user to sign in before moving to checkout page
    this.notifySer.setNotify({class: 'info', msg: this.translateSer.instant('toast-notifications.sign-in-to-complete-order'), time: 5000});
  }
}
