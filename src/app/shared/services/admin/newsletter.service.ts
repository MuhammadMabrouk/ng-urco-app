import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup } from '@angular/forms';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Newsletter } from 'src/app/shared/interfaces/admin/newsletter';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  constructor(
    private translateSer: TranslateService,
    private fs: AngularFirestore,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService,
    private globalJs: GlobalJsFunctionsService
  ) { }

  // add new subscribe
  newSubscribe(form: FormGroup) {
    this.mainLoadingSer.startLoading();

    const email = form.getRawValue().email;
    const data = {
      seqNo: Date.now(),
      email,
      subscribedDate: (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string)
    };

    // get the saved newsletter emails count then save the new email
    this.fs.firestore.collection('newsletter').get().then(snap => {

      this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');

          // try to get the subscribed email
          const saveNewEmail = this.fs.firestore.doc(`newsletter/${email}`).get()
            .then(doc => {

              // check if subscribed or not
              if (doc.exists) {
                this.mainLoadingSer.endLoading();
                this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.already-subscribed'), time: 5000});
              } else {

                // add new subscribe email
                this.fs.collection('newsletter').doc(email).set(data)
                  .then(() => {
                    // store the new newsletter emails count in database
                    const newsletterEmailsCount = snap.size + 1;

                    // check if the 'general-info' doc is exist or not
                    if (!infoDoc.exists) {
                      generalInfoDoc.set({ newsletterEmailsCount }).then(() => saveNewEmail);
                    } else {
                      generalInfoDoc.update({ newsletterEmailsCount }).then(() => saveNewEmail);
                    }

                    this.mainLoadingSer.endLoading();
                    this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.subscribed-successfully'), time: 5000});
                    // reset the form after subscribing
                    form.reset();
                  })
                  .catch(() => {
                    this.mainLoadingSer.endLoading();
                    this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.oops-something-wrong'), time: 5000});
                  });
              }
            })
            .catch(() => {
              this.mainLoadingSer.endLoading();
            });
        });
    });
  }

  // get all newsletter emails
  getAllNewsletterEmails(): Promise<Newsletter[]> {
    return this.fs.collection('newsletter', ref => ref.orderBy('seqNo', 'desc')).valueChanges().pipe(first()).toPromise();
  }

  // delete selected newsletter email
  deleteEmail(id: string) {
    // get the newsletter emails number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of newsletter emails in the database
        const newsletterEmailsCount = res.data().newsletterEmailsCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ newsletterEmailsCount });

        return this.fs.collection('newsletter').doc(id).delete();
      });
  }
}
