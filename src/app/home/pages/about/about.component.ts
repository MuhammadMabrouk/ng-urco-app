import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { Accordion } from 'src/app/shared/ui-elements/accordion/accordion';
import { Subscription } from 'rxjs';

// animations
import { fadeInStaggerEnter } from 'src/app/shared/animations/fade-effects/fade/fade-in-stagger-enter';
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    fadeInStaggerEnter,
    fadeInUp
  ]
})
export class AboutComponent implements OnInit, OnDestroy {

  // FAQs accordion items
  accordionItems: Accordion[];

  // store subscription for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('about-page.page-title'));

    // translated array of the accordion items
    this.accordionItems = Object.values(this.translateSer.instant('about-page.FAQs'));
  }
}
