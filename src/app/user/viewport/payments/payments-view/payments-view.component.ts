import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { PaymentsService } from 'src/app/shared/services/user/payments.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserPayments } from 'src/app/shared/interfaces/user/user-payments';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-payments-view',
  templateUrl: './payments-view.component.html',
  styleUrls: ['./payments-view.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class PaymentsViewComponent implements OnInit, OnDestroy {

  // payment methods array for loop
  paymentMethods: UserPayments[];
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
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authSer: AuthService,
    private paymentsSer: PaymentsService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get payment methods data
    this.getPaymentMethods();

    // get payment methods count from database
    this.simplePaginationSer.getItemsCount('paymentMethods', true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('payments-page.page-title'));
  }

  // for ngFor trackBy
  track(index: number, method: UserPayments) {
    return method ? method.id : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get payment methods data
  getPaymentMethods() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined' && this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('payments', this.generalSettingsSer.generalSettings.paymentMethodsLimit, userId)
          .subscribe(res => {

            // check if there is items or not
            if (res.length) {

              // get items within the specified limit
              const itemsPlusOne = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as UserPayments
                };
              });

              // toggle navigation buttons status
              this.simplePaginationSer.toggleNavigationBtnsStatus(
                res, itemsPlusOne, this.generalSettingsSer.generalSettings.paymentMethodsLimit
              );

              // if an item is deleted, remove it from view too
              if (this.itemDeleted) {
                this.deleteItemFromView(this.deletedItemId, this.paymentMethods);
                this.itemDeleted = false;
                this.deletedItemId = undefined;
              }

              // change animation states
              if (this.paymentMethods) {
                itemsPlusOne.every((item, index) => {
                  if (JSON.stringify(item) !== JSON.stringify(this.paymentMethods[index])) {
                    this.changeAnimationStatus();
                  } else { return false; }
                });
              } else {
                this.changeAnimationStatus();
              }

              this.paymentMethods = itemsPlusOne;

              // get the first item of the currently viewed page
              this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

            } else {
              this.paymentMethods = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as UserPayments
                };
              });
            }

            this.mainLoadingSer.endLoading();
          }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getPaymentMethods();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(this.simplePaginationSer.getNextItemsPage(
      'payments', this.generalSettingsSer.generalSettings.paymentMethodsLimit, true
    ).subscribe(res => {

      // check if there is items or not
      if (res.length) {

        // get next items within the specified limit
        const itemsPlusOne = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as UserPayments
          };
        });

        // toggle navigation buttons status
        this.simplePaginationSer.toggleNavigationBtnsStatus(
          res, itemsPlusOne, this.generalSettingsSer.generalSettings.paymentMethodsLimit, true
        );

        // if an item is deleted, remove it from view too
        if (this.itemDeleted) {
          this.deleteItemFromView(this.deletedItemId, this.paymentMethods);
          this.itemDeleted = false;
          this.deletedItemId = undefined;
        }

        // change animation states
        itemsPlusOne.every((item, index) => {
          if (JSON.stringify(item) !== JSON.stringify(this.paymentMethods[index])) {
            this.changeAnimationStatus();
          } else { return false; }
        });

        this.paymentMethods = itemsPlusOne;

        // get the first item of the currently viewed page
        this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

      } else {
        this.paymentMethods = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as UserPayments
          };
        });
      }

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.paymentMethodsLimit);
  }

  // get prev items page
  getPrevPage(lastItemInLastPageDeleted?: boolean) {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(this.simplePaginationSer.getPrevItemsPage(
      'payments', this.generalSettingsSer.generalSettings.paymentMethodsLimit, true
    ).subscribe(res => {

      // check if there is items or not
      if (res.length) {

        // get prev items within the specified limit
        const itemsPlusOne = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as UserPayments
          };
        });

        // toggle navigation buttons status
        this.simplePaginationSer.toggleNavigationBtnsStatus(
          res, itemsPlusOne, this.generalSettingsSer.generalSettings.paymentMethodsLimit, false, true, lastItemInLastPageDeleted
        );

        // if an item is deleted, remove it from view too
        if (this.itemDeleted) {
          this.deleteItemFromView(this.deletedItemId, this.paymentMethods);
          this.itemDeleted = false;
          this.deletedItemId = undefined;
        }

        // change animation states
        itemsPlusOne.every((item, index) => {
          if (JSON.stringify(item) !== JSON.stringify(this.paymentMethods[index])) {
            this.changeAnimationStatus();
          } else { return false; }
        });

        this.paymentMethods = itemsPlusOne;

        // get the last item of the currently viewed page
        this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

      } else {
        this.paymentMethods = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as UserPayments
          };
        });
      }

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.paymentMethodsLimit);
  }

  // masking credit card number except the last four digits
  maskingCreditCardNumber(value: string, unmaskedCharsCount: number) {
    return this.globalJs.stringMask(value, unmaskedCharsCount);
  }

  // delete payment method
  deleteMethod(id: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-payment-method'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // make the delete flag true
      this.itemDeleted = true;
      this.deletedItemId = id;

      // delete the method
      this.paymentsSer.deletePaymentMethod(id)
        .then(() => {
          // decrease methods count on delete
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
            this.getPaymentMethods();
            this.simplePaginationSer.spOptions.allItemsCount--;

          } else {
            this.simplePaginationSer.spOptions.allItemsCount--;
          }

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.card-deleted'), time: 5000});
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
        });
    }
  }

  // delete this item from the view
  deleteItemFromView(id: string, allItems: any[]) {
    // get the selected item
    const selectedItemIndex = allItems.findIndex(item => item.id === id);

    // remove the selected item
    allItems.splice(selectedItemIndex, 1);
  }
}
