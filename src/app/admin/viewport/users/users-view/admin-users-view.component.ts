import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UsersService } from 'src/app/shared/services/admin/users.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-admin-users-view',
  templateUrl: './admin-users-view.component.html',
  styleUrls: ['./admin-users-view.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class AdminUsersViewComponent implements OnInit, OnDestroy {

  // users array for loop
  users: UserProfile[];
  // animation states
  animationStates: string = 'inActive';

  // store subscriptions for unsubscribe when component destroyed
  subscriptions: Subscription[] = [];
  langChangeObservable: Subscription;

  constructor(
    private translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private usersSer: UsersService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(1, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get users data
    this.getUsers();

    // get users count from database
    this.simplePaginationSer.getItemsCount('users');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('users-page.page-title'));
  }

  // for ngFor trackBy
  track(index: number) {
    return index;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get users data
  getUsers() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('users', this.generalSettingsSer.generalSettings.usersLimit)
          .subscribe(res => {

            // check if there is items or not
            if (res.length) {

              // get items within the specified limit
              const itemsPlusOne = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as UserProfile
                };
              });

              // toggle navigation buttons status
              this.simplePaginationSer.toggleNavigationBtnsStatus(
                res, itemsPlusOne, this.generalSettingsSer.generalSettings.usersLimit
              );

              // change animation states
              if (this.users) {
                itemsPlusOne.every((item, index) => {
                  if (JSON.stringify(item) !== JSON.stringify(this.users[index])) {
                    this.changeAnimationStatus();
                  } else { return false; }
                });
              } else {
                this.changeAnimationStatus();
              }

              this.users = itemsPlusOne;

              // get the first item of the currently viewed page
              this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

            } else {
              this.users = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as UserProfile
                };
              });
            }

            this.mainLoadingSer.endLoading();
          }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getUsers();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getNextItemsPage('users', this.generalSettingsSer.generalSettings.usersLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get next items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as UserProfile
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.usersLimit, true
            );

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.users[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.users = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.users = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as UserProfile
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.usersLimit);
  }

  // get prev items page
  getPrevPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getPrevItemsPage('users', this.generalSettingsSer.generalSettings.usersLimit)
        .subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get prev items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as UserProfile
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.usersLimit, false, true
            );

            // change animation states
            itemsPlusOne.every((item, index) => {
              if (JSON.stringify(item) !== JSON.stringify(this.users[index])) {
                this.changeAnimationStatus();
              } else { return false; }
            });

            this.users = itemsPlusOne;

            // get the last item of the currently viewed page
            this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

          } else {
            this.users = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as UserProfile
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.usersLimit);
  }

  // make this user an admin
  makeAdmin(userId: string) {
    this.mainLoadingSer.startLoading();

    this.usersSer.makeAdmin(userId)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.applied'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }

  // remove this user from administrators
  removeAdmin(userId: string) {
    this.mainLoadingSer.startLoading();

    this.usersSer.removeAdmin(userId)
      .then(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.applied'), time: 5000});
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
        this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
      });
  }
}
