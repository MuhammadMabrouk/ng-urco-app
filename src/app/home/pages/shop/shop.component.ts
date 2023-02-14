import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Options } from 'ng5-slider';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { ActivatedRoute } from '@angular/router';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { CategoriesService } from 'src/app/shared/services/admin/categories.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Category } from 'src/app/shared/interfaces/admin/category';
import { MyFormsList } from 'src/app/shared/interfaces/my-forms-list';
import { GoodsSortingMethodTitle } from 'src/app/shared/interfaces/goods/goods-sorting/goods-sorting-method-title';
import { GoodsSortingMethod } from 'src/app/shared/interfaces/goods/goods-sorting/goods-sorting-method';
import { Subscription } from 'rxjs';
import { Subject } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';
import { slideToggle } from 'src/app/shared/animations/slide-effects/slide-up-down/slide-toggle';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    fadeInUpStaggerBind,
    slideToggle
  ]
})
export class ShopComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // goods array for loop
  goodsArray: Goods[];

  // filter toggle
  isFilterShown: boolean = false;

  // columns layout
  isMultiColumns: boolean = true;

  // last good of the currently viewed page
  lastGood;
  // growing limit to be doubled when loading new goods
  growingLimit: number;
  // flag to check if there are more goods
  hasMoreGoods: boolean = false;
  // flag to show/hide infinite scroll loading
  isLoadingGoods: boolean = false;

  // displayed in selection bar
  categoryName: string;
  childCategoryName: string;

  shownGoodsLength: number[] = this.generalSettingsSer.shopGoodsLength;
  shownGoodsLimit: number;
  // to access key and value of object using *ngFor in the template
  objectKeys = Object.keys;
  sortingMethodsTitles: GoodsSortingMethodTitle;
  selectedSortingMethodTitle: string;
  selectedSortingMethodValue: GoodsSortingMethod;

  // subject to force re-calculation of all cached dimensions
  updateSticky: Subject<boolean> = new Subject();

  // categories in categories widget
  categories: Category[];

  // filter forms
  priceFilterForm: FormGroup;
  colorFilterForm: FormGroup;
  rateFilterForm: FormGroup;

  // to store initial values
  priceFilterFormDefaultValue;
  colorFilterFormDefaultValue;
  rateFilterFormDefaultValue;

  // to store new values
  priceFilterFormNewValue;
  colorFilterFormNewValue;
  rateFilterFormNewValue;

  // to toggle visibility of save buttons
  priceFilterFormChanged: boolean;
  colorFilterFormChanged: boolean;
  rateFilterFormChanged: boolean;

  // range slider options for template
  rangeSliderOptions: Options = {
    floor: 0,
    ceil: 10000,
    translate: (value: number): string => String(value)
  };

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  goodsObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private fb: FormBuilder,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private route: ActivatedRoute,
    private goodsSer: GoodsService,
    private categoriesSer: CategoriesService,
    public generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get categories data
    this.getCategories();

    // price filter form
    this.priceFilterForm = this.fb.group({
      price: this.fb.control([0, 10000])
    });

    // color filter form
    this.colorFilterForm = this.fb.group({
      color: [null, Validators.required]
    });

    // rate filter form
    this.rateFilterForm = this.fb.group({
      rate: [null, Validators.required]
    });

    // get the default values and set it to the form controls
    this.priceFilterFormDefaultValue = JSON.stringify(this.priceFilterForm.getRawValue());
    this.colorFilterFormDefaultValue = JSON.stringify(this.colorFilterForm.getRawValue());
    this.rateFilterFormDefaultValue = JSON.stringify(this.rateFilterForm.getRawValue());

    // listening for changes in the filter default values to show save buttons
    this.onFilterChanges();

    // get the saved layout for the shop page
    this.getSavedLayout();

    // re-calculation of all cached dimensions
    this.updateSticky.next(true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.goodsObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('shop-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;

    // get translated sorting methods
    this.sortingMethodsTitles = this.translateSer.instant('shop-page.selection-bar.goods-sorting.methods');
    this.selectedSortingMethodTitle = this.sortingMethodsTitles.default;
  }

  // for ngFor trackBy
  track(index: number, goods: Goods) {
    return goods ? goods.id : undefined;
  }

  // listening for filter changes to show save buttons
  onFilterChanges(): void {
    const allForms: MyFormsList[] = [
      { formGroup: this.priceFilterForm, formName: 'priceFilterForm' },
      { formGroup: this.colorFilterForm, formName: 'colorFilterForm' },
      { formGroup: this.rateFilterForm, formName: 'rateFilterForm' }
    ];

    for (const form of allForms) {
      this.subscriptions.push(form.formGroup.valueChanges.subscribe(() => {
        // check whether the first change or not
        if (!this[`${form.formName}NewValue`]) {

          // check if the value has changed
          if (JSON.stringify(form.formGroup.getRawValue()) !== this[`${form.formName}DefaultValue`]) {
            this[`${form.formName}Changed`] = true;
          } else { this[`${form.formName}Changed`] = false; }

        } else {
          // check if the value has changed
          if (JSON.stringify(form.formGroup.getRawValue()) !== this[`${form.formName}NewValue`]) {
            this[`${form.formName}Changed`] = true;
          } else { this[`${form.formName}Changed`] = false; }
        }
      }));
    }
  }

  // get the saved layout for the shop page
  getSavedLayout() {
    const savedLayout: string = localStorage.getItem('savedShopLayout');

    // check if a layout is saved
    if (savedLayout) {
      if (savedLayout === 'multi-columns') {
        this.isMultiColumns = true;

      } else if (savedLayout === 'single-column') {
        this.isMultiColumns = false;
      }
    }
  }

  // change layout for the shop page
  changeLayout(value: boolean) {
    this.isMultiColumns = value;

    if (this.isMultiColumns === true) {
      localStorage.setItem('savedShopLayout', 'multi-columns');

    } else if (this.isMultiColumns === false) {
      localStorage.setItem('savedShopLayout', 'single-column');
    }
  }

  // get all goods data
  getGoods(
      values?: any,
      lastGood?: any,
      filterName?: string,
      clearedFilterName?: string,
      sortingMethod?: GoodsSortingMethod,
      goodsLimit: number = this.shownGoodsLimit
    ) {
    this.mainLoadingSer.startLoading();

    // unsubscribe from previous subscriptions if needed
    if (this.goodsObservable) { this.goodsObservable.unsubscribe(); }

    // wait for 'generalSettings' until it is set
    if (goodsLimit || this.generalSettingsSer.generalSettings) {

      const limit = goodsLimit || this.generalSettingsSer.generalSettings.shopGoodsLimit;

      // initialize the 'growingLimit' in the first time
      if (!this.growingLimit || !lastGood) { this.growingLimit = limit; }

      // get goods data
      this.goodsObservable = this.goodsSer.getGoods(values, lastGood, filterName, clearedFilterName, sortingMethod, limit)
        .subscribe(data => {
          let initialGoodsArray = this.goodsArray || [];

          if (lastGood) {
            data.map(el => {
              initialGoodsArray.push({
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              });
            });
          } else {
            initialGoodsArray = data.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });
          }

          if (initialGoodsArray.length > this.growingLimit) {

            // increment the limit
            this.growingLimit += limit;

            // remove the excess good
            initialGoodsArray.pop();
            // get the last good of the currently viewed page
            this.lastGood = data[data.length - 2].payload.doc;
            this.hasMoreGoods = true;
          } else {
            // reset
            this.lastGood = null;
            this.hasMoreGoods = false;
          }

          // stop the animation
          this.isLoadingGoods = false;

          this.goodsArray = initialGoodsArray;

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading());

    } else {
      setTimeout(() => {
        this.getGoods(values, lastGood, filterName, clearedFilterName, sortingMethod, goodsLimit);
      }, 250);
    }
  }

  // load more goods on scrolling down
  loadMoreOnScroll() {
    if (this.hasMoreGoods) {
      // start the animation
      this.isLoadingGoods = true;

      this.getGoods(undefined, this.lastGood, undefined, undefined, this.selectedSortingMethodValue);
    }
  }

  // clear the filter
  clearFilter(form: FormGroup, formName: string) {
    // back to the initial values
    this[`${formName}NewValue`] = undefined;
    form.reset(JSON.parse(this[`${formName}DefaultValue`]));

    // get goods after clearing the filter
    this.getGoods(undefined, undefined, undefined, formName, this.selectedSortingMethodValue);
  }

  // apply the filter
  filterGoods(form: FormGroup, formName: string) {
    // get filtered goods
    this.getGoods(form.getRawValue(), undefined, formName, undefined, this.selectedSortingMethodValue);

    // get and set the new values
    this[`${formName}NewValue`] = JSON.stringify(form.getRawValue());
    // hide save buttons
    this[`${formName}Changed`] = false;

    // set the sorting method to 'priceHighToLow' on applying price filter
    this.goodsSorting(this.sortingMethodsTitles.priceHighToLow);
  }

  // get categories data
  getCategories() {
    this.mainLoadingSer.startLoading();

    this.categoriesSer.getCategories()
      .then((data) => {
        this.categories = data;

        /* get the all goods in the first open by default (look at the service => get all goods if no values)
        /* then listen for changes in the current url to get the goods filtered by categories. */
        this.onUrlChanges();

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }

  // show and hide sub categories in categories widget
  showSubCategories(el, menu) {
    $(menu).slideToggle();
    $(el.target).toggleClass('open');
  }

  // listen for changes in the current url
  onUrlChanges() {
    this.subscriptions.push(this.route.queryParamMap.subscribe(params => {

      // reset and back to the initial state
      this.categoryName = null;
      this.childCategoryName = null;

      /* get the all goods in the first open by default (look at the service => get all goods if no values) */
      /* get the goods in selected category if you get parameters in the url otherwise get all goods */

      // get all the goods in the categories two level filter
      if (params.get('cat') && params.get('subCat')) {

        const selectedCategory = this.categories
          .filter(category => category.catSlug === params.get('cat'))
          .map(category => {
            const children = category.children.find(child => child.catSlug === params.get('subCat'));

            // displayed in selection bar
            this.categoryName = category.catName[this.currentLang];
            this.childCategoryName = children.catName[this.currentLang];

            return {
              catName: category.catName,
              catSlug: category.catSlug,
              children
            };
          })[0];

        // get the goods in selected sub category
        this.getGoods(selectedCategory, undefined, 'categoriesFilter', undefined, this.selectedSortingMethodValue);

      } else if (params.get('cat')) { // get all the goods in the categories one level filter

        const selectedCategory = this.categories
          .filter(category => category.catSlug === params.get('cat'))
          .map(category => {
            // displayed in selection bar
            this.categoryName = category.catName[this.currentLang];
            this.childCategoryName = null;

            return category.catSlug;
          })[0];

        // get all goods in selected parent category
        this.getGoods(selectedCategory, undefined, 'categoriesFilter', undefined, this.selectedSortingMethodValue);

      } else { // get all goods (filters not applied)
        this.getGoods(undefined, undefined, undefined, 'categoriesFilter', this.selectedSortingMethodValue);
      }
    }));
  }

  // change the shown goods length
  changeGoodsLength(limit: number) {
    this.shownGoodsLimit = limit;

    // get limited goods
    this.getGoods(undefined, undefined, undefined, undefined, undefined, limit);
  }

  // sorting the shown goods
  goodsSorting(sortingMethod: string) {
    // sorting the goods by ...
    if (sortingMethod === 'default') { // sequential number

      if (this.goodsSer.goodsFilters.length && this.goodsSer.goodsFilters[0].filterName === 'priceFilterForm') {
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.cannot-sort-by-newest-in-price-filter'), time: 5000});
        return;
      }

      this.goodsArray = undefined;
      this.selectedSortingMethodTitle = this.sortingMethodsTitles[sortingMethod];
      this.selectedSortingMethodValue = { filed: 'seqNo', sortingDir: 'desc' };

      this.getGoods(undefined, undefined, undefined, undefined, { filed: 'seqNo', sortingDir: 'desc' });

    } else if (sortingMethod === 'most-rated') { // rating score

      if (this.goodsSer.goodsFilters.length) {
        if (this.goodsSer.goodsFilters[0].filterName === 'priceFilterForm') {
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.cannot-sort-by-rating-in-price-filter'), time: 5000});
          return;
        }

        if (this.goodsSer.goodsFilters[0].filterName === 'rateFilterForm') {
          this.notifySer.setNotify({
            class: 'danger',
            msg: this.translateSer.instant('toast-notifications.invalid-sort-method'),
            time: 5000
          });
          return;
        }
      }

      this.goodsArray = undefined;
      this.selectedSortingMethodTitle = this.sortingMethodsTitles[sortingMethod];
      this.selectedSortingMethodValue = { filed: 'rating', sortingDir: 'desc' };

      this.getGoods(undefined, undefined, undefined, undefined, { filed: 'rating', sortingDir: 'desc' });

    } else if (sortingMethod === 'price-low-to-high') { // price from low to high

      this.goodsArray = undefined;
      this.selectedSortingMethodTitle = this.sortingMethodsTitles[sortingMethod];
      this.selectedSortingMethodValue = { filed: 'priceAfterDiscount', sortingDir: 'asc' };

      this.getGoods(undefined, undefined, undefined, undefined, { filed: 'priceAfterDiscount', sortingDir: 'asc' });

    } else if (sortingMethod === 'price-high-to-low') { // price from high to low

      this.goodsArray = undefined;
      this.selectedSortingMethodTitle = this.sortingMethodsTitles[sortingMethod];
      this.selectedSortingMethodValue = { filed: 'priceAfterDiscount', sortingDir: 'desc' };

      this.getGoods(undefined, undefined, undefined, undefined, { filed: 'priceAfterDiscount', sortingDir: 'desc' });
    }
  }
}
