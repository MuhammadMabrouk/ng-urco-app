import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/admin/users.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-admin-single-user',
  templateUrl: './admin-single-user.component.html',
  styleUrls: ['./admin-single-user.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class AdminSingleUserComponent implements OnInit, OnDestroy {

  // viewed user id
  userId: string;

  // this user data
  thisUser: UserProfile;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private usersSer: UsersService,
    private activeRoute: ActivatedRoute
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);

    // get the id of the viewed user
    this.userId = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get this user data
    this.getSingleUser();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('user-page.page-title'));
  }

  // get this user data
  getSingleUser() {
    this.mainLoadingSer.startLoading();

    this.usersSer.getSingleUser(this.userId)
      .then(userDoc => {
        this.thisUser = userDoc.data();

        this.mainLoadingSer.endLoading();
      })
      .catch(() => this.mainLoadingSer.endLoading());
  }
}
