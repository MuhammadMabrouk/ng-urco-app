import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { CurrencyExchangeService } from 'src/app/shared/services/currency-exchange.service';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from 'src/app/shared/services/admin/requests.service';
import { OrdersService } from 'src/app/shared/services/user/orders.service';
import { UserOrders } from 'src/app/shared/interfaces/user/user-orders';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-admin-single-request',
  templateUrl: './admin-single-request.component.html',
  styleUrls: ['./admin-single-request.component.scss'],
  animations: [
    fadeInUpStaggerEnter,
    fadeInUpStaggerBind
  ]
})
export class AdminSingleRequestComponent implements OnInit, OnDestroy {

  // current language
  currentLang: string;

  // viewed request id
  requestId: string;

  // this request data
  thisRequest: UserOrders;

  // this request goods data
  requestGoods: Goods[];

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    public currencyExchangeSer: CurrencyExchangeService,
    private requestsSer: RequestsService,
    private ordersSer: OrdersService,
    private activeRoute: ActivatedRoute
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);

    // get the id of the viewed request
    this.requestId = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get this request data
    this.getSingleRequest();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('single-request-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

  // get this request data
  getSingleRequest() {
    this.mainLoadingSer.startLoading();

    this.subscriptions.push(this.requestsSer.getSingleRequest(this.requestId).subscribe(data => {
      this.thisRequest = data;

      this.subscriptions.push(this.ordersSer.getSingleOrderContent(data.customerId, this.requestId)
        .subscribe(goods => this.requestGoods = goods));

      this.mainLoadingSer.endLoading();
    }, () => this.mainLoadingSer.endLoading()));
  }

  // change the status of this request
  changeRequestStatus(requestId: string, customerId: string, status: string) {
    this.mainLoadingSer.startLoading();

    this.requestsSer.changeRequestStatus(requestId, customerId, status)
      .then(() => { this.mainLoadingSer.endLoading(); })
      .catch(() => { this.mainLoadingSer.endLoading(); });
  }
}
