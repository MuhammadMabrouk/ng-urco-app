import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { UserGuardService } from 'src/app/shared/services/routes-guards/user-guard.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-user-navigator',
  templateUrl: './user-navigator.component.html',
  styleUrls: ['./user-navigator.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class UserNavigatorComponent implements OnInit, OnDestroy {

  // here to store user info
  userInfo: UserProfile;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private authSer: AuthService,
    private userSer: UserService,
    private userGuardSer: UserGuardService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(0);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get user info
    this.userSer.getUserInfo().then(data => {
      this.userInfo = this.userSer.userInfo = data;
    });
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('user-dashboard-page.page-title'));
  }

  // logOut
  logOut() {
    // tell the guard to go to the homepage after logout
    this.userGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }
}
