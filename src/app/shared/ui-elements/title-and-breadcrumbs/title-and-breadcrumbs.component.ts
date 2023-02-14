import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// animations
import { fadeInDown } from 'src/app/shared/animations/fade-effects/fade-down/fade-in-down';

@Component({
  selector: 'app-title-and-breadcrumbs',
  templateUrl: './title-and-breadcrumbs.component.html',
  styleUrls: ['./title-and-breadcrumbs.component.scss'],
  animations: [fadeInDown]
})
export class TitleAndBreadcrumbsComponent implements OnInit, OnDestroy {

  componentBeforeNavigation = null;
  currentUrl: string;
  breadcrumbs: string[];

  // store subscription for unsubscribe when component destroyed
  routerObservable: Subscription;

  constructor(
    public title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // trigger breadcrumbs in the first opening for the page
    this.triggerBreadcrumbsInTheFirstOpen();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.routerObservable.unsubscribe();
  }

  // trigger breadcrumbs in the first opening for the page
  triggerBreadcrumbsInTheFirstOpen() {

    // wait for the new version of options until it is set in every page
    if (this.TitleAndBreadcrumbsSer.newCachedVersion > this.TitleAndBreadcrumbsSer.oldCachedVersion) {

      const levels = this.TitleAndBreadcrumbsSer.levels;
      const escape = this.TitleAndBreadcrumbsSer.escape;
      this.TitleAndBreadcrumbsSer.oldCachedVersion = this.TitleAndBreadcrumbsSer.newCachedVersion;

      // triggered in the first opening for the page
      this.getRoutes(this.router.url, levels, escape);

      // trigger breadcrumbs when any event happen in the current url
      this.triggerBreadcrumbsOnChangesInPageUrl();

    } else {
      setTimeout(() => this.triggerBreadcrumbsInTheFirstOpen(), 250);
    }
  }

  // trigger breadcrumbs when any event happen in the current url
  triggerBreadcrumbsOnChangesInPageUrl() {

    // listen for changes in the current url
    this.routerObservable = this.router.events.pipe(filter(value => value instanceof NavigationEnd)).subscribe((value: NavigationEnd) => {

      let currentRoute = this.route;

      // get last child
      while (currentRoute.firstChild) { currentRoute = currentRoute.firstChild; }

      // check if the component has changed
      if (this.componentBeforeNavigation !== currentRoute.component) {

        // wait for the new version of options until it is set in every page
        if (this.TitleAndBreadcrumbsSer.newCachedVersion > this.TitleAndBreadcrumbsSer.oldCachedVersion) {

          const levels = this.TitleAndBreadcrumbsSer.levels;
          const escape = this.TitleAndBreadcrumbsSer.escape;
          this.TitleAndBreadcrumbsSer.oldCachedVersion = this.TitleAndBreadcrumbsSer.newCachedVersion;

          // trigger breadcrumbs
          this.getRoutes(value.url, levels, escape);

        } else {
          setTimeout(() => this.triggerBreadcrumbsOnChangesInPageUrl(), 250);
        }
      }

      // cache the current component to compare with it later
      this.componentBeforeNavigation = currentRoute.component;
    });
  }

  // get routes from current url
  getRoutes(url: string, levels: number, escape: string[]) {
    this.currentUrl = url;

    // create array from routes then remove empty elements (first element) and 'index' elements
    const initialArr = url.split('/').filter(item => {
      if (escape) {
        if (item && item !== 'index' && escape.indexOf(item) === -1) { return item; }
      } else {
        if (item && item !== 'index') { return item; }
      }
    });

    // remove the last element (current route) from the array
    initialArr.pop();

    // remove all elements after the specified level
    initialArr.length = initialArr.length > levels ? levels : initialArr.length;

    this.breadcrumbs = initialArr;
  }

  // go to clicked route
  goToRoute(route: string) {
    const url = this.currentUrl.split(route)[0];
    this.router.navigateByUrl(`${url}${route}`);
  }
}
