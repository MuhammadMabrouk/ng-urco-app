import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { Router, ActivatedRoute } from '@angular/router';
import { GoodsService } from 'src/app/shared/services/goods/goods.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-admin-products-view',
  templateUrl: './admin-products-view.component.html',
  styleUrls: ['./admin-products-view.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class AdminProductsViewComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // goods array for loop
  goods: Goods[];

  // animation states
  animationStates: string = 'inActive';
  itemDeleted: boolean;
  deletedItemId: string;

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
    private router: Router,
    private activeRoute: ActivatedRoute,
    private goodsSer: GoodsService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get goods data
    this.getGoods();

    // get goods count from database
    this.simplePaginationSer.getItemsCount('goods');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('products-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: Goods) {
    return good ? good.id : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get goods data
  getGoods() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('goods', this.generalSettingsSer.generalSettings.goodsLimit).subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.goodsLimit
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.goods);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            if (this.goods) {
              itemsPlusOne.every((item, index) => {
                if (JSON.stringify(item) !== JSON.stringify(this.goods[index])) {
                  this.changeAnimationStatus();
                } else { return false; }
              });
            } else {
              this.changeAnimationStatus();
            }

            this.goods = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.goods = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getGoods();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getNextItemsPage('goods', this.generalSettingsSer.generalSettings.goodsLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get next items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.goodsLimit, true
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.goods);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.goods[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.goods = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.goods = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.goodsLimit);
  }

  // get prev items page
  getPrevPage(lastItemInLastPageDeleted?: boolean) {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getPrevItemsPage('goods', this.generalSettingsSer.generalSettings.goodsLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get prev items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.goodsLimit, false, true, lastItemInLastPageDeleted
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.goods);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.goods[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.goods = itemsPlusOne;

            // get the last item of the currently viewed page
            this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

          } else {
            this.goods = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Goods
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.goodsLimit);
  }

  // delete the good
  deleteGood(id: string, images: string[]) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-product'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // make the delete flag true
      this.itemDeleted = true;
      this.deletedItemId = id;

      // delete the good
      this.goodsSer.deleteGood(id)
        .then(() => {
          // delete the images of this good from the storage
          this.goodsSer.deleteUploadedImages(images);

          // decrease goods count on delete
          if (
            // if in the last page and there is only one item
            this.simplePaginationSer.spOptions.viewItemsCountStart === this.simplePaginationSer.spOptions.viewItemsCountEnd
            && this.simplePaginationSer.spOptions.viewItemsCountStart === this.simplePaginationSer.spOptions.allItemsCount
            && this.simplePaginationSer.spOptions.viewItemsCountStart !== 1
          ) {
            // go to the prev page and decrease the total items count
            this.getPrevPage(true);
            this.simplePaginationSer.spOptions.allItemsCount--;

            // if in the last page and there is several items
          } else if (this.simplePaginationSer.spOptions.viewItemsCountEnd === this.simplePaginationSer.spOptions.allItemsCount) {
            this.simplePaginationSer.spOptions.viewItemsCountEnd--;
            this.simplePaginationSer.spOptions.allItemsCount--;

            // if in the first page and items are below the limit
          } else if (this.simplePaginationSer.spOptions.viewItemsCountStart === 1) {
            // call the first page function and decrease the total items count
            this.getGoods();
            this.simplePaginationSer.spOptions.allItemsCount--;

          } else {
            this.simplePaginationSer.spOptions.allItemsCount--;
          }

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.product-deleted'), time: 5000});
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
  deleteItemFromView(id: string, allItems: any[]) {
    // get the selected item
    const selectedItem = allItems.filter(item => {
      return item.id === id;
    });

    // remove the selected item
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].id === selectedItem[0].id) {
        allItems.splice(i, 1);
      }
    }
  }
}
