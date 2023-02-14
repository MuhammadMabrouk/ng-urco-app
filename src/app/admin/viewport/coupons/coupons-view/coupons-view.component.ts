import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CouponsService } from 'src/app/shared/services/admin/coupons.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Coupons } from 'src/app/shared/interfaces/admin/coupons';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-coupons-view',
  templateUrl: './coupons-view.component.html',
  styleUrls: ['./coupons-view.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class CouponsViewComponent implements OnInit, OnDestroy {

  // coupons array for loop
  coupons: Coupons[];
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
    private couponsSer: CouponsService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get coupons data
    this.getCoupons();

    // get coupons count from database
    this.simplePaginationSer.getItemsCount('coupons');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('coupons-page.page-title'));
  }

  // for ngFor trackBy
  track(index: number, coupon: Coupons) {
    return coupon ? coupon.id : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get coupons data
  getCoupons() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('coupons', this.generalSettingsSer.generalSettings.couponsLimit).subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.couponsLimit
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.coupons);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            if (this.coupons) {
              itemsPlusOne.every((item, index) => {
                if (JSON.stringify(item) !== JSON.stringify(this.coupons[index])) {
                  this.changeAnimationStatus();
                } else { return false; }
              });
            } else {
              this.changeAnimationStatus();
            }

            this.coupons = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.coupons = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getCoupons();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getNextItemsPage('coupons', this.generalSettingsSer.generalSettings.couponsLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get next items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.couponsLimit, true
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.coupons);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.coupons[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.coupons = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.coupons = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.couponsLimit);
  }

  // get prev items page
  getPrevPage(lastItemInLastPageDeleted?: boolean) {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getPrevItemsPage('coupons', this.generalSettingsSer.generalSettings.couponsLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get prev items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.couponsLimit, false, true, lastItemInLastPageDeleted
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.coupons);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.coupons[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.coupons = itemsPlusOne;

            // get the last item of the currently viewed page
            this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

          } else {
            this.coupons = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as Coupons
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.couponsLimit);
  }

  // masking coupon id except the last four characters
  maskingCouponId(value: string, unmaskedCharsCount: number) {
    return this.globalJs.stringMask(value, unmaskedCharsCount);
  }

  // delete the coupon
  deleteCoupon(id: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-coupon'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // make the delete flag true
      this.itemDeleted = true;
      this.deletedItemId = id;

      // delete the coupon
      this.couponsSer.deleteCoupon(id)
        .then(() => {
          // decrease coupons count on delete
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
            this.getCoupons();
            this.simplePaginationSer.spOptions.allItemsCount--;

          } else {
            this.simplePaginationSer.spOptions.allItemsCount--;
          }

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.coupon-deleted'), time: 5000});
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
