import { Component, OnInit, AfterViewChecked, OnDestroy, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { WishlistService } from 'src/app/shared/services/goods/wishlist.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { Wishlist } from 'src/app/shared/interfaces/goods/wishlist';
import { GoodReview } from 'src/app/shared/interfaces/goods/good-review';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-single-good',
  templateUrl: './single-good.component.html',
  styleUrls: ['./single-good.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class SingleGoodComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('mainImg') mainImg: ElementRef;
  @ViewChild('detailsArea') detailsArea: ElementRef;
  @ViewChild('thumbnails') thumbnails: ElementRef;

  // viewed good id
  goodId: string;

  // this good data
  singleGood: Goods;

  // this good reviews
  goodReviews: GoodReview[];

  // details area height
  detailsAreaHeight: string;

  // size of this good
  goodSize: string;
  // quantity of this good
  goodQty: number;

  // current slide index
  currentSlideIndex: number = 0;
  // last slide index
  lastSlideIndex: number;

  // last review of the currently viewed page
  lastReview;
  // reviews limit
  reviewsLimit: number = 8;
  // growing limit to be doubled when loading new reviews
  growingLimit: number;
  // flag to check if there are more reviews
  hasMoreReviews: boolean = false;
  // flag to show/hide loading spinner
  isLoadingReviews: boolean = false;
  // flag to toggle the review modal
  reviewModal: boolean = false;

  // store subscriptions for unsubscribe when component destroyed
  reviewsObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    public translateSer: TranslateService,
    private title: Title,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    public currencyExchangeSer: CurrencyExchangeService,
    private activeRoute: ActivatedRoute,
    private render: Renderer2,
    public authSer: AuthService,
    private goodsSer: GoodsService,
    private cartSer: CartService,
    private wishlistSer: WishlistService,
    public userSer: UserService
  ) {}

  ngOnInit() {
    // get the id of the viewed good
    this.subscriptions.push(this.activeRoute.paramMap.subscribe(params => {
      this.goodId = params.get('id');

      // get this good data
      this.getSingleGood();

      // get the reviews of this good
      this.getGoodReviews();
    }));
  }

  ngAfterViewChecked() {
    // get details area height
    setTimeout(() => this.detailsAreaHeight = this.detailsArea.nativeElement.offsetHeight + 'px');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // for ngFor trackBy
  trackReviews(index: number, review: GoodReview) {
    return review ? review.userId : undefined;
  }

  // get single good data
  getSingleGood() {
    this.mainLoadingSer.startLoading();

    this.goodsSer.getSingleGood(this.goodId)
      .then(res => {
        const data: Goods = res.data();

        // set page title in the browser
        this.title.setTitle(`${data.name[this.translateSer.currentLang]} - ${this.translateSer.instant('single-good-page.urco')}`);

        this.singleGood = data;

        // get last slide index
        this.lastSlideIndex = data.images.length - 1;

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // get the reviews of this good
  getGoodReviews(lastReview?: any) {
    this.mainLoadingSer.startLoading();

    // unsubscribe from previous subscriptions if needed
    if (this.reviewsObservable) { this.reviewsObservable.unsubscribe(); }

    // initialize the 'growingLimit' in the first time
    if (!this.growingLimit || !lastReview) { this.growingLimit = this.reviewsLimit; }

    this.reviewsObservable = this.goodsSer.getGoodReviews(this.goodId, this.reviewsLimit, lastReview)
      .subscribe(data => {

        if (data.length) {
          let initialReviewsArray = this.goodReviews || [];

          if (lastReview) {
            data.map(el => initialReviewsArray.push(el.payload.doc.data()));
          } else {
            initialReviewsArray = data.map(el => el.payload.doc.data());
          }

          if (initialReviewsArray.length > this.growingLimit) {

            // increment the limit
            this.growingLimit += this.reviewsLimit;

            // remove the excess review
            initialReviewsArray.pop();
            // get the last review of the currently viewed group
            this.lastReview = data[data.length - 2].payload.doc;
            this.hasMoreReviews = true;
          } else {
            // reset
            this.lastReview = null;
            this.hasMoreReviews = false;
          }

          // stop the animation
          this.isLoadingReviews = false;

          // set the user's review in the top of the list
          const userReviewIndex = initialReviewsArray.findIndex(el => this.authSer.userId === el.userId);
          const userReview = initialReviewsArray.splice(userReviewIndex, 1)[0];
          initialReviewsArray.splice(0, 0, userReview);

          this.goodReviews = initialReviewsArray;
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading());
  }

  // load more reviews
  loadMoreReviews() {
    // start the animation
    this.isLoadingReviews = true;

    if (this.hasMoreReviews) {
      this.getGoodReviews(this.lastReview);
    } else {
      setTimeout(() => {
        this.isLoadingReviews = false;
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.no-more-reviews'), time: 5000});
      }, 400);
    }
  }

  // scroll up & down in thumbnails slider
  thumbnailsScrolling(dir: string) {
    let top = this.thumbnails.nativeElement.scrollTop;
    const steps = 94;

    if (dir === 'up') {
      top -= steps;
    } else if (dir === 'down') {
      top += steps;
    }

    this.thumbnails.nativeElement.scroll({ top, behavior: 'smooth' });
  }

  // get this image to the view area
  getToView(index: number) {
    this.currentSlideIndex = index;

    this.render.addClass(this.mainImg.nativeElement, 'animated');
    setTimeout(() => this.render.removeClass(this.mainImg.nativeElement, 'animated'), 500);
  }

  // get the next slide
  getNextSlide() {
    this.currentSlideIndex += 1;

    if (this.currentSlideIndex > this.lastSlideIndex) {
      this.currentSlideIndex = 0;
    }

    this.render.addClass(this.mainImg.nativeElement, 'animated');
    setTimeout(() => this.render.removeClass(this.mainImg.nativeElement, 'animated'), 500);
  }

  // get the prev slide
  getPrevSlide() {
    this.currentSlideIndex -= 1;

    if (this.currentSlideIndex === -1) {
      this.currentSlideIndex = this.lastSlideIndex;
    }

    this.render.addClass(this.mainImg.nativeElement, 'animated');
    setTimeout(() => this.render.removeClass(this.mainImg.nativeElement, 'animated'), 500);
  }

  // navigate between images by swiping
  swipeToNavigate(swipeDir: string) {
    if (this.translateSer.currentLang === 'en') {

      (swipeDir === 'left') ? this.getNextSlide() : this.getPrevSlide();

    } else if (this.translateSer.currentLang === 'ar') {

      (swipeDir === 'left') ? this.getPrevSlide() : this.getNextSlide();
    }
  }

  // update size value
  getSize(value: string) {
    this.goodSize = value;
  }

  // update qty value
  updateQty(value: number) {
    this.goodQty = value;
  }

  // add good to cart
  addToCart(id: string) {
    const data: Cart = {
      id,
      seqNo: Date.now(),
      size: this.goodSize || (this.singleGood.sizes) ? this.singleGood.sizes[0] : 'N/A',
      qty: this.goodQty || 1
    };
    this.cartSer.addToCart(data);
  }

  // add good to wishlist
  addToWishlist(id: string) {
    const data: Wishlist = {
      id,
      seqNo: Date.now(),
      size: this.goodSize || (this.singleGood.sizes) ? this.singleGood.sizes[0] : 'N/A',
      qty: this.goodQty || 1
    };
    this.wishlistSer.addToWishlist(data);
  }

  // go to this tab
  goToTab(el: MouseEvent, tab: HTMLElement) {
    const btn = el.target;
    // get siblings
    const btns = (btn as HTMLElement).parentElement.children;
    const tabs = tab.parentElement.children;
    // tabs count
    const tabsLength = tabs.length;

    // remove class 'active' from all elements
    for (let i = 0; i < tabsLength; i++) {
      this.render.removeClass(btns.item(i), 'active');
      this.render.removeClass(tabs.item(i), 'active');
    }

    // add class 'active' to current element
    this.render.addClass(btn, 'active');
    this.render.addClass(tab, 'active');
  }

  // edit the review of the user
  editReview() {
    this.reviewModal = true;
  }

  // cancel review
  cancelReview() {
    this.reviewModal = false;
  }
}
