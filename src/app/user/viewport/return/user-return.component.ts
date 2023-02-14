import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { ReturnGoods } from 'src/app/shared/interfaces/goods/return-goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-user-return',
  templateUrl: './user-return.component.html',
  styleUrls: ['./user-return.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class UserReturnComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // returned goods array for loop
  returnedGoods: ReturnGoods[];
  // animation states
  animationStates: string = 'inActive';

  // flag to toggle the modal of good rating
  reviewModal: boolean = false;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    public currencyExchangeSer: CurrencyExchangeService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authSer: AuthService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['user']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get returned goods data
    this.getReturnedGoods();

    // get returned goods count from database
    this.simplePaginationSer.getItemsCount('returnedGoods', true);
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('user-returns-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // for ngFor trackBy
  track(index: number, good: ReturnGoods) {
    return good ? good.id : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get returned goods data
  getReturnedGoods() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute });

    // wait for user id until it is set
    const userId = this.authSer.userId;
    if (typeof userId !== 'undefined' && this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('returns', this.generalSettingsSer.generalSettings.returnedGoodsLimit, userId).subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as ReturnGoods
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.returnedGoodsLimit
            );

            // change animation states
            if (this.returnedGoods) {
              itemsPlusOne.every((item, index) => {
                if (JSON.stringify(item) !== JSON.stringify(this.returnedGoods[index])) {
                  this.changeAnimationStatus();
                } else { return false; }
              });
            } else {
              this.changeAnimationStatus();
            }

            this.returnedGoods = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.returnedGoods = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as ReturnGoods
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getReturnedGoods();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(this.simplePaginationSer.getNextItemsPage(
      'returns', this.generalSettingsSer.generalSettings.returnedGoodsLimit, true
    ).subscribe(res => {

      // check if there is items or not
      if (res.length) {

        // get next items within the specified limit
        const itemsPlusOne = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as ReturnGoods
          };
        });

        // toggle navigation buttons status
        this.simplePaginationSer.toggleNavigationBtnsStatus(
          res, itemsPlusOne, this.generalSettingsSer.generalSettings.returnedGoodsLimit, true
        );

        // change animation states
        itemsPlusOne.every((item, index) => {
          if (JSON.stringify(item) !== JSON.stringify(this.returnedGoods[index])) {
            this.changeAnimationStatus();
          } else { return false; }
        });

        this.returnedGoods = itemsPlusOne;

        // get the first item of the currently viewed page
        this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

      } else {
        this.returnedGoods = res.map(el => {
          return {
            id: el.payload.doc.id,
            ...el.payload.doc.data() as ReturnGoods
          };
        });
      }

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute, this.generalSettingsSer.generalSettings.returnedGoodsLimit);
  }

  // get prev items page
  getPrevPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(this.simplePaginationSer.getPrevItemsPage(
      'returns', this.generalSettingsSer.generalSettings.returnedGoodsLimit, true
    ).subscribe(res => {

        // check if there is items or not
        if (res.length) {

          // get prev items within the specified limit
          const itemsPlusOne = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ReturnGoods
            };
          });

          // toggle navigation buttons status
          this.simplePaginationSer.toggleNavigationBtnsStatus(
            res, itemsPlusOne, this.generalSettingsSer.generalSettings.returnedGoodsLimit, false, true
          );

          // change animation states
          itemsPlusOne.every((item, index) => {
            if (JSON.stringify(item) !== JSON.stringify(this.returnedGoods[index])) {
              this.changeAnimationStatus();
            } else { return false; }
          });

          this.returnedGoods = itemsPlusOne;

          // get the last item of the currently viewed page
          this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

        } else {
          this.returnedGoods = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ReturnGoods
            };
          });
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute, this.generalSettingsSer.generalSettings.returnedGoodsLimit);
  }

  // show the review modal for this good
  productReview() {
    this.reviewModal = true; // open the modal
  }

  // cancel review
  cancelReview() {
    this.reviewModal = false; // close the modal
  }
}
