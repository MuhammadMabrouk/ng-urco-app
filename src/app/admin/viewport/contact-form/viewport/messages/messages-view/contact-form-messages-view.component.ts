import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactFormMessagesService } from 'src/app/shared/services/admin/contact-form/contact-form-messages.service';
import { ContactFormBlacklistService } from 'src/app/shared/services/admin/contact-form/contact-form-blacklist.service';
import { SimplePaginationService } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { ContactFormMessages } from 'src/app/shared/interfaces/admin/contact-form/contact-form-messages';
import { ContactFormBlackList } from 'src/app/shared/interfaces/admin/contact-form/contact-form-black-list';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerBind } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-bind';

@Component({
  selector: 'app-contact-form-messages-view',
  templateUrl: './contact-form-messages-view.component.html',
  styleUrls: ['./contact-form-messages-view.component.scss'],
  animations: [fadeInUpStaggerBind]
})
export class ContactFormMessagesViewComponent implements OnInit, OnDestroy {

  // contact form messages array for loop
  contactFormMessages: ContactFormMessages[];
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
    private cfMessagesSer: ContactFormMessagesService,
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

    // get all messages data
    this.getMessages();

    // get messages count from database
    this.simplePaginationSer.getItemsCount('messages');
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('messages-page.page-title'));
  }

  // for ngFor trackBy
  track(index: number, message: ContactFormMessages) {
    return message ? message.id : undefined;
  }

  // change animation states
  changeAnimationStatus() {
    this.animationStates = this.animationStates === 'inActive' ? 'active' : 'inActive';
  }

  // get messages data
  getMessages() {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();

    // go to first page
    this.router.navigate(['page/1'], { relativeTo: this.activeRoute.parent });

    // wait for 'generalSettings' until it is set
    if (this.generalSettingsSer.generalSettings) {

      this.subscriptions.push(
        this.simplePaginationSer.getItems('contact-form/inbox/messages', this.generalSettingsSer.generalSettings.messagesLimit)
          .subscribe(res => {

            // check if there is items or not
            if (res.length) {

              // get items within the specified limit
              const itemsPlusOne = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as ContactFormMessages
                };
              });

              // toggle navigation buttons status
              this.simplePaginationSer.toggleNavigationBtnsStatus(
                res, itemsPlusOne, this.generalSettingsSer.generalSettings.messagesLimit
              );

              // if an item is deleted, remove it from view too
              if (this.itemDeleted) {
                this.deleteItemFromView(this.deletedItemId, this.contactFormMessages);
                this.itemDeleted = false;
                this.deletedItemId = undefined;
              }

              // change animation states
              if (this.contactFormMessages) {
                itemsPlusOne.every((item, index) => {
                  if (JSON.stringify(item) !== JSON.stringify(this.contactFormMessages[index])) {
                    this.changeAnimationStatus();
                  } else { return false; }
                });
              } else {
                this.changeAnimationStatus();
              }

              this.contactFormMessages = itemsPlusOne;

              // get the first item of the currently viewed page
              this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

            } else {
              this.contactFormMessages = res.map(el => {
                return {
                  id: el.payload.doc.id,
                  ...el.payload.doc.data() as ContactFormMessages
                };
              });
            }

            this.mainLoadingSer.endLoading();
          }, () => this.mainLoadingSer.endLoading())
      );

    } else {
      setTimeout(() => {
        this.getMessages();
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
        'contact-form/inbox/messages', this.generalSettingsSer.generalSettings.messagesLimit
      ).subscribe(res => {

        // check if there is items or not
        if (res.length) {

          // get next items within the specified limit
          const itemsPlusOne = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormMessages
            };
          });

          // toggle navigation buttons status
          this.simplePaginationSer.toggleNavigationBtnsStatus(
            res, itemsPlusOne, this.generalSettingsSer.generalSettings.messagesLimit, true
          );

          // if an item is deleted, remove it from view too
          if (this.itemDeleted) {
            this.deleteItemFromView(this.deletedItemId, this.contactFormMessages);
            this.itemDeleted = false;
            this.deletedItemId = undefined;
          }

          // change animation states
          itemsPlusOne.every((item, index) => {
            if (JSON.stringify(item) !== JSON.stringify(this.contactFormMessages[index])) {
              this.changeAnimationStatus();
            } else { return false; }
          });

          this.contactFormMessages = itemsPlusOne;

          // get the first item of the currently viewed page
          this.simplePaginationSer.spOptions.firstItem = res[0].payload.doc;

        } else {
          this.contactFormMessages = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormMessages
            };
          });
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToNextPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.messagesLimit);
  }

  // get prev items page
  getPrevPage(lastItemInLastPageDeleted?: boolean) {
    // unsubscribe from previous subscriptions if needed
    if (this.subscriptions.length) { this.subscriptions.forEach(s => s.unsubscribe()); }

    this.mainLoadingSer.startLoading();
    this.subscriptions.push(
      this.simplePaginationSer.getPrevItemsPage(
        'contact-form/inbox/messages', this.generalSettingsSer.generalSettings.messagesLimit
      ).subscribe(res => {

        // check if there is items or not
        if (res.length) {

          // get prev items within the specified limit
          const itemsPlusOne = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormMessages
            };
          });

          // toggle navigation buttons status
          this.simplePaginationSer.toggleNavigationBtnsStatus(
            res, itemsPlusOne, this.generalSettingsSer.generalSettings.messagesLimit, false, true, lastItemInLastPageDeleted
          );

          // if an item is deleted, remove it from view too
          if (this.itemDeleted) {
            this.deleteItemFromView(this.deletedItemId, this.contactFormMessages);
            this.itemDeleted = false;
            this.deletedItemId = undefined;
          }

          // change animation states
          itemsPlusOne.every((item, index) => {
            if (JSON.stringify(item) !== JSON.stringify(this.contactFormMessages[index])) {
              this.changeAnimationStatus();
            } else { return false; }
          });

          this.contactFormMessages = itemsPlusOne;

          // get the last item of the currently viewed page
          this.simplePaginationSer.spOptions.lastItem = res[res.length - 1].payload.doc;

        } else {
          this.contactFormMessages = res.map(el => {
            return {
              id: el.payload.doc.id,
              ...el.payload.doc.data() as ContactFormMessages
            };
          });
        }

        this.mainLoadingSer.endLoading();
      }, () => this.mainLoadingSer.endLoading())
    );

    // change page number & items count
    this.simplePaginationSer.changesWhenGoToPrevPage(this.activeRoute.parent, this.generalSettingsSer.generalSettings.messagesLimit);
  }

  // delete the message
  deleteMessage(id: string) {
    const confirmMsg = confirm(this.translateSer.instant('confirm-msg.sure-to-delete-message'));

    if (confirmMsg) {
      this.mainLoadingSer.startLoading();

      // make the delete flag true
      this.itemDeleted = true;
      this.deletedItemId = id;

      // delete the message
      this.cfMessagesSer.deleteMessage(id)
        .then(() => {
          // decrease messages count on delete
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
            this.getMessages();
            this.simplePaginationSer.spOptions.allItemsCount--;

          } else {
            this.simplePaginationSer.spOptions.allItemsCount--;
          }

          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.message-deleted'), time: 5000});
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

  // block the sender's email
  blockEmailAddress(email: string) {
    const data: ContactFormBlackList = { seqNo: Date.now(), email };

    this.cfBlackListSer.blockEmailAddress(data);
  }
}
