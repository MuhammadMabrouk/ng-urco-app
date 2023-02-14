import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { AdminGuardService } from 'src/app/shared/services/routes-guards/admin-guard.service';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-admin-navigator',
  templateUrl: './admin-navigator.component.html',
  styleUrls: ['./admin-navigator.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class AdminNavigatorComponent implements OnInit, OnDestroy {

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private authSer: AuthService,
    private adminGuardSer: AdminGuardService
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
    this.title.setTitle(this.translateSer.instant('admin-dashboard-page.page-title'));
  }

  // logOut
  logOut() {
    // tell the guard to go to the homepage after logout
    this.adminGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }
}
