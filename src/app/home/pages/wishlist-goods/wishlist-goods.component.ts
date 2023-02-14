import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { WishlistService } from 'src/app/shared/services/goods/wishlist.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Wishlist } from 'src/app/shared/interfaces/goods/wishlist';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';
import { slideFadeUpRedHighlightState } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-fade-up-red-highlight';

@Component({
  selector: 'app-wishlist-goods',
  templateUrl: './wishlist-goods.component.html',
  styleUrls: ['./wishlist-goods.component.scss'],
  animations: [
    fadeInUp,
    fadeInUpStaggerBind,
    slideFadeUpRedHighlightState
  ]
})
export class WishlistGoodsComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  isLoggedIn: boolean = false; // user login status
  wishlistGoods: Goods[];

  // animation states
  animationStates: string[];

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  isUserObservable: Subscription = Subscription.EMPTY;
  deleteWishlistItemIfLoggedOutObservable: Subscription = Subscription.EMPTY;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    public currencyExchangeSer: CurrencyExchangeService,
    private authSer: AuthService,
    private wishlistSer: WishlistService,
    private cartSer: CartService,
    private storageSer: StorageService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get wishlist goods data
    this.getWishlistGoods();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.isUserObservable.unsubscribe();
    this.deleteWishlistItemIfLoggedOutObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('wishlist-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: Goods) {
    return good ? good.id : undefined;
  }

  // get wishlist goods data
  getWishlistGoods() {
    this.mainLoadingSer.startLoading();

    this.isUserObservable = this.authSer.user.subscribe(user => {

      if (user) {

        this.isLoggedIn = true;
        this.deleteWishlistItemIfLoggedOutObservable.unsubscribe();

      } else { this.isLoggedIn = false; }

      this.wishlistSer.getWishlistGoodsData()
        .then((goods: Wishlist[]) => {

          this.wishlistGoods = goods;

          // create array of states
          this.animationStates = goods.map(() => 'in');

          this.mainLoadingSer.endLoading();
        })
        .catch(() => this.mainLoadingSer.endLoading());
    });
  }

  // add to cart from wishlist
  addToCartFromWishlist(good: Goods, index: number) {
    const data: Cart = {
      id: good.id,
      seqNo: Date.now(),
      size: (good as Cart).size || (good.sizes) ? good.sizes[0] : 'N/A',
      qty: good.qty || 1
    };
    this.cartSer.addToCart(data);

    // delete this good from wishlist
    if (this.isLoggedIn) { // if an user

      // delete this good from wishlist
      this.wishlistSer.deleteWishlistItem(good.id)
        .then(() => {
          // change animation states
          this.changeAnimationStates(index);
        });

    } else { // if a guest

      // delete this good from the localStorage
      const wishlistGoods: Goods[] = JSON.parse(localStorage.getItem('wishlistData'));
      wishlistGoods.splice(index, 1);
      this.deleteWishlistItemIfLoggedOutObservable = this.storageSer.setItem('wishlistData', wishlistGoods).subscribe();

      // change animation states
      this.changeAnimationStates(index);
    }
  }

  // add all to cart from wishlist
  addAllToCartFromWishlist() {
    const data: Cart[] = [];
    this.wishlistGoods.forEach((good: Cart) => {
      data.push({
        id: good.id,
        seqNo: Date.now(),
        size: good.size,
        qty: good.qty || 1
      });
    });
    this.cartSer.addAllToCart(data);

    // check if the user is registered or a guest
    if (this.isLoggedIn) { // if registered

      // delete all items from wishlist
      this.wishlistSer.deleteAllWishlistItems();

    } else { // if a guest

      // delete all wishlist items from localStorage
      this.deleteWishlistItemIfLoggedOutObservable = this.storageSer.setItem('wishlistData', []).subscribe();
    }

    // change animation states
    const itemsLength = this.animationStates.length;
    this.animationStates.length = 0;
    this.animationStates = new Array(itemsLength).fill('out');

    // remove all the items from the dom
    setTimeout(() => this.wishlistGoods = [], 800);
  }

  // delete selected item from wishlist
  deleteWishlistItem(id: string, index: number) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-product'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // change animation states
      this.changeAnimationStates(index);

      // check if the user is registered or a guest
      if (this.isLoggedIn) {

        this.wishlistSer.deleteWishlistItem(id)
          .then(() => {
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

        const wishlistGoods: Wishlist[] = JSON.parse(localStorage.getItem('wishlistData'));

        // sort the array by the sequential number
        wishlistGoods.sort((a, b) => a.seqNo - b.seqNo).reverse();

        // delete selected item from wishlist
        wishlistGoods.splice(index, 1);

        this.deleteWishlistItemIfLoggedOutObservable = this.storageSer.setItem('wishlistData', wishlistGoods).subscribe();

        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.item-deleted'), time: 5000});
      }
    }
  }

  // change animation states
  changeAnimationStates(index: number) {
    // change animation states
    this.animationStates[index] = (this.animationStates[index] === 'in') ? 'out' : '';

    setTimeout(() => {
      // remove selected item from the dom
      this.wishlistGoods.splice(index, 1);

      // remove selected item's state
      this.animationStates.splice(index, 1);
    }, 800);
  }
}
