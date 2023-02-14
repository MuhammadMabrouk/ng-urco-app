import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { MainSliderService } from 'src/app/shared/services/goods/main-slider.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { MainSlider } from 'src/app/shared/interfaces/goods/main-slider';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { Goods } from 'src/app/shared/interfaces/goods/goods';

@Component({
  selector: 'app-main-slider',
  templateUrl: './main-slider.component.html',
  styleUrls: ['./main-slider.component.scss']
})
export class MainSliderComponent implements OnInit, OnDestroy {

  // main slider array
  mainSliderGoods: MainSlider[];
  // current slide index
  currentSlideIndex: number = 0;
  // all slides count
  slidesCount: string = '00';
  slidesCountNumbers: number[];
  // last slide index
  lastSlideIndex: number;
  // autoplay speed
  sliderSpeed: number = 5000;
  // slider autoplay
  sliderTimingRun;

  constructor(
    public translateSer: TranslateService,
    private mainLoadingSer: MainLoadingService,
    private mainSliderSer: MainSliderService,
    private cartSer: CartService
  ) { }

  ngOnInit() {
    // get the goods data of the main slider
    this.getMainSliderGoodsData();
  }

  ngOnDestroy() {
    // clear the interval
    if (this.sliderTimingRun) { clearInterval(this.sliderTimingRun); }
  }

  // get the goods data of the main slider
  getMainSliderGoodsData() {
    this.mainLoadingSer.startLoading();

    this.mainSliderSer.getMainSliderGoodsData()
      .then(goods => {
        // get all slides count
        const count = goods.length;
        this.slidesCount = count < 10 ? '0' + count : String(count);
        this.slidesCountNumbers = [...Array(count)].map((_, index) => index + 1);

        // get last slide index
        this.lastSlideIndex = +this.slidesCount - 1;

        // get the slider goods
        this.mainSliderGoods = goods;

        // trigger the slider autoplay
        this.sliderTimingRun = setInterval(() => this.sliderTiming(), this.sliderSpeed);

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // slider first run
  sliderTiming() {
    this.currentSlideIndex += 1;

    if (this.currentSlideIndex > this.lastSlideIndex) {
      this.currentSlideIndex = 0;
    }
  }

  // get the next slide
  getNextSlide() {
    this.currentSlideIndex += 1;

    if (this.currentSlideIndex > this.lastSlideIndex) {
      this.currentSlideIndex = 0;
    }

    // restart autoplay time
    this.sliderResetTiming();
  }

  // get the prev slide
  getPrevSlide() {
    this.currentSlideIndex -= 1;

    if (this.currentSlideIndex === -1) {
      this.currentSlideIndex = this.lastSlideIndex;
    }

    // restart autoplay time
    this.sliderResetTiming();
  }

  // navigate between slides by swiping
  swipeToNavigate(swipeDir: string) {
    if (this.translateSer.currentLang === 'en') {

      (swipeDir === 'left') ? this.getNextSlide() : this.getPrevSlide();

    } else if (this.translateSer.currentLang === 'ar') {

      (swipeDir === 'left') ? this.getPrevSlide() : this.getNextSlide();
    }
  }

  // get the clicked dot slide
  getClickedDotSlide(index: number) {
    this.currentSlideIndex = index;

    // restart autoplay time
    this.sliderResetTiming();
  }

  // restart the autoplay time
  sliderResetTiming() {
    // clear the previous autoplay time
    clearInterval(this.sliderTimingRun);

    // restart the autoplay time
    this.sliderTimingRun = setInterval(() => {
      this.sliderTiming();
    }, this.sliderSpeed);
  }

  // add selected good to the cart then go to the shopping-cart page
  buyNow(good: Goods) {
    const data: Cart = {
      id: good.id,
      size: (good.sizes) ? good.sizes[0] : 'N/A',
      qty: 1,
      seqNo: Date.now()
    };

    // add selected good to the cart
    this.cartSer.addToCart(data, true);
  }
}
