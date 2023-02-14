import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { TitleAndBreadcrumbsService } from 'src/app/shared/ui-elements/title-and-breadcrumbs/title-and-breadcrumbs.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { ActivatedRoute } from '@angular/router';
import { ContactFormMessagesService } from 'src/app/shared/services/admin/contact-form/contact-form-messages.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { ContactFormMessages } from 'src/app/shared/interfaces/admin/contact-form/contact-form-messages';
import { Subscription } from 'rxjs';

// animations
import { fadeInUpStaggerEnter } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up-stagger-enter';

@Component({
  selector: 'app-contact-form-single-message',
  templateUrl: './contact-form-single-message.component.html',
  styleUrls: ['./contact-form-single-message.component.scss'],
  animations: [fadeInUpStaggerEnter]
})
export class ContactFormSingleMessageComponent implements OnInit, OnDestroy {

  // this message data
  thisMessage: ContactFormMessages;
  // viewed message id
  messageId: string;

  // store subscriptions for unsubscribe when component destroyed
  langChangeObservable: Subscription;

  constructor(
    public translateSer: TranslateService,
    private title: Title,
    private TitleAndBreadcrumbsSer: TitleAndBreadcrumbsService,
    private mainLoadingSer: MainLoadingService,
    private cfMessagesSer: ContactFormMessagesService,
    private activeRoute: ActivatedRoute,
    private globalJs: GlobalJsFunctionsService
  ) {
    // breadcrumbs options
    this.TitleAndBreadcrumbsSer.setBreadcrumbsOptions(3, ['admin', 'view']);

    // get the id of the viewed message
    this.messageId = this.activeRoute.snapshot.paramMap.get('id');
  }

  ngOnInit(): void {
    // updates when the language changes
    this.onLangChanges(); // for the first load
    this.langChangeObservable = this.translateSer.onLangChange.subscribe(() => this.onLangChanges());

    // get this message data
    this.getSingleMessage();
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.langChangeObservable.unsubscribe();
  }

  // updates when the language changes
  onLangChanges() {
    // page title in the browser
    this.title.setTitle(this.translateSer.instant('single-message-page.page-title'));
  }

  // get this message data
  getSingleMessage() {
    this.mainLoadingSer.startLoading();

    this.cfMessagesSer.getSingleMessage(this.messageId)
      .then(messageDoc => {

        this.thisMessage = messageDoc.data();

        if (!this.thisMessage.readingDate) {
          const todayDate = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string); // get today date

          this.thisMessage.readingDate = todayDate;

          // set reading date in the database
          this.cfMessagesSer.setReadingDate(this.messageId, todayDate);
        }

        this.mainLoadingSer.endLoading();
      })
      .catch(() => {
        this.mainLoadingSer.endLoading();
      });
  }
}
