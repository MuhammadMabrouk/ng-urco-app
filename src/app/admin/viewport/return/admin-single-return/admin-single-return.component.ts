import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { ActivatedRoute } from '@angular/router';
import { AdminReturnsService } from 'src/app/shared/services/admin/admin-returns.service';
import { ReturnGoods } from 'src/app/shared/interfaces/goods/return-goods';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-admin-single-return',
  templateUrl: './admin-single-return.component.html',
  styleUrls: ['./admin-single-return.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class AdminSingleReturnComponent implements OnInit, OnDestroy {

  // viewed returned good id
  returnedGoodId: string;

  // current language
  currentLang: string;

  // this returned good data
  thisReturnedGood: ReturnGoods;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    public translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private adminReturnsSer: AdminReturnsService,
    private activeRoute: ActivatedRoute
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);

    // get the id of the viewed returned good
    this.returnedGoodId = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get this returned good data
    this.getSingleReturnedGood();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('single-return-page.page-title'));

    // get current language
    this.currentLang = this.translateSer.currentLang;
  }

    // get this returned good data
  getSingleReturnedGood() {
    this.mainLoadingSer.startLoading();

    this.adminReturnsSer.getSingleReturnedGood(this.returnedGoodId)
      .then(returnedGoodDoc => {
        this.thisReturnedGood = returnedGoodDoc.data() as ReturnGoods;

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }
}
