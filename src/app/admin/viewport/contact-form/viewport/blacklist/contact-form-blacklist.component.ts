import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactFormBlacklistService } from 'src/app/shared/services/admin/contact-form/contact-form-blacklist.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { ContactFormBlackList } from 'src/app/shared/interfaces/admin/contact-form/contact-form-black-list';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-contact-form-blacklist',
  templateUrl: './contact-form-blacklist.component.html',
  styleUrls: ['./contact-form-blacklist.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class ContactFormBlacklistComponent implements OnInit, OnDestroy {

  // black list emails array for loop
  blackListEmails: ContactFormBlackList[];
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
    private cfBlackListSer: ContactFormBlacklistService,
    private simplePaginationSer: SimplePaginationService,
    private generalSettingsSer: GeneralSettingsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(2, ['admin']);
  }

  ngOnInit() {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get all blacklist emails
    this.getBlackListEmails();

    // get black list emails count from database
    this.simplePaginationSer.getItemsCount('blackListEmails');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('contact-form-blacklist-page.page-title'));
  }

  // for ngFor trackBy
  track(index: number, email: ContactFormBlackList) {
    return email ? email.seqNo : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get blacklist emails data
  getBlackListEmails() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate([], { relativeTo: this.activeRoute, queryParams: { page: 1 } });

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems(
          'contact-form/black-list/blocked-emails', this.generalSettingsSer.generalSettings.blackListEmailsLimit
        ).subscribe(res => {

          // check if there is items or not
          if (res.length) {

            // get items within the specified limit
            const itemsPlusOne = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as ContactFormBlackList
              };
            });

            // toggle navigation buttons status
            this.simplePaginationSer.toggleNavigationBtnsStatus(
              res, itemsPlusOne, this.generalSettingsSer.generalSettings.blackListEmailsLimit
            );

            // if an item is deleted, remove it from view too
            if (this.itemDeleted) {
              this.deleteItemFromView(this.deletedItemId, this.blackListEmails);
              this.itemDeleted = false;
              this.deletedItemId = undefined;
            }

            // change animation states
            if (this.blackListEmails) {
              itemsPlusOne.every((item, index) => {
                if (JSON.stringify(item) !== JSON.stringify(this.blackListEmails[index])) {
                  this.changeAnimationStatus();
                } else { return false; }
              });
            } else {
              this.changeAnimationStatus();
            }

            this.blackListEmails = itemsPlusOne;

            // get the first item of the currently viewed page
            this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

          } else {
            this.blackListEmails = res.map(el => {
              return {
                id: el.payload.doc.id,
                ...el.payload.doc.data() as ContactFormBlackList
              };
            });
          }

          this.mainLoadingSer.endLoading();
        }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getBlackListEmails();
      }, 250);
    }
  }

  // get next items page
  getNextPage() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getNextItemsPage(
        'contact-form/black-list/blocked-emails', this.generalSettingsSer.generalSettings.blackListEmailsLimit
      ).subscribe(res => {

        // check if there is items or not
        if (res.length) {

          // get next items within the specified limit
          const itemsPlusOne = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormBlackList
            };
          });

          // toggle navigation buttons status
          this.simplePaginationSer.toggleNavigationBtnsStatus(
            res, itemsPlusOne, this.generalSettingsSer.generalSettings.blackListEmailsLimit, true
          );

          // if an item is deleted, remove it from view too
          if (this.itemDeleted) {
            this.deleteItemFromView(this.deletedItemId, this.blackListEmails);
            this.itemDeleted = false;
            this.deletedItemId = undefined;
          }

          // change animation states
          itemsPlusOne.every((item, index) => {
            if (JSON.stringify(item) !== JSON.stringify(this.blackListEmails[index])) {
              this.changeAnimationStatus();
            } else { return false; }
          });

          this.blackListEmails = itemsPlusOne;

          // get the first item of the currently viewed page
          this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

        } else {
          this.blackListEmails = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormBlackList
            };
          });
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute, this.generalSettingsSer.generalSettings.blackListEmailsLimit, true);
  }

  // get prev items page
  getPrevPage(lastItemInLastPageDeleted?: boolean) {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getPrevItemsPage(
        'contact-form/black-list/blocked-emails', this.generalSettingsSer.generalSettings.blackListEmailsLimit
      ).subscribe(res => {

        // check if there is items or not
        if (res.length) {

          // get prev items within the specified limit
          const itemsPlusOne = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormBlackList
            };
          });

          // toggle navigation buttons status
          this.simplePaginationSer.toggleNavigationBtnsStatus(
            res, itemsPlusOne, this.generalSettingsSer.generalSettings.blackListEmailsLimit, false, true, lastItemInLastPageDeleted
          );

          // if an item is deleted, remove it from view too
          if (this.itemDeleted) {
            this.deleteItemFromView(this.deletedItemId, this.blackListEmails);
            this.itemDeleted = false;
            this.deletedItemId = undefined;
          }

          // change animation states
          itemsPlusOne.every((item, index) => {
            if (JSON.stringify(item) !== JSON.stringify(this.blackListEmails[index])) {
              this.changeAnimationStatus();
            } else { return false; }
          });

          this.blackListEmails = itemsPlusOne;

          // get the last item of the currently viewed page
          this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

        } else {
          this.blackListEmails = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormBlackList
            };
          });
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute, this.generalSettingsSer.generalSettings.blackListEmailsLimit, true);
  }

  // delete the black list email
  deleteEmail(id: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-email'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // make the delete flag true
      this.itemDeleted = true;
      this.deletedItemId = id;

      // delete the black list email
      this.cfBlackListSer.deleteBlackListEmail(id)
        .then(() => {
          // decrease black list emails count on delete
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
            this.getBlackListEmails();
            this.simplePaginationSer.spOptions.allItemsCount--;

          } else {
            this.simplePaginationSer.spOptions.allItemsCount--;
          }

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.email-deleted'), time: 5000});
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
    const selectedItem = allItems.filter(item => {
      return item.id === id;
    });

    // remove the selected item
    for (let i = 0; i < allItems.length; i++) {
      if (allItems[i].id === selectedItem[0].id) {
        allItems.splice(i, 1);
      }
    }
  }
}
