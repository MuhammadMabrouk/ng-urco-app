import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { ContactFormBlackList } from 'src/app/shared/interfaces/admin/contact-form/contact-form-black-list';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactFormBlacklistService {

  constructor(
    private translateSer: TranslateService,
    private fs: AngularFirestore,
    private mainLoadingSer: MainLoadingService,
    private notifySer: NotificationsService
  ) { }

  // block the sender's email
  blockEmailAddress(data: ContactFormBlackList) {
    this.mainLoadingSer.startLoading();

    // check if the blocked email is exist or not
    this.fs.firestore.doc(`contact-form/black-list/blocked-emails/${data.email}`).get()
      .then(doc => {
        if (!doc.exists) {

          // get the number of documents in the collection
          this.fs.firestore.collection('contact-form/black-list/blocked-emails').get().then(snap => {

            // store emails count in database
            const blackListEmailsCount = snap.size + 1;

            this.fs.firestore.doc(`dashboard/general-info`).get()
              .then(infoDoc => {

                // general-info doc path
                const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');

                // save the new email
                const saveNewEmail = this.fs.collection('contact-form/black-list/blocked-emails').doc(data.email).set(data).then(() => {
                  this.mainLoadingSer.endLoading();
                  this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.email-blocked'), time: 5000});
                });

                // check if the 'general-info' doc is exist or not
                if (!infoDoc.exists) {
                  generalInfoDoc.set({ blackListEmailsCount }).then(() => saveNewEmail);
                } else {
                  generalInfoDoc.update({ blackListEmailsCount }).then(() => saveNewEmail);
                }
              });
          });

        } else {
          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.this-email-already-blocked'), time: 5000});
        }
      })
      .catch(() => {
        // save the new email
        this.fs.collection('contact-form/black-list/blocked-emails').doc(data.email).set(data).then(() => {
          this.mainLoadingSer.endLoading();
          this.notifySer.setNotify({class: 'success', msg: this.translateSer.instant('toast-notifications.email-blocked'), time: 5000});
        });
      });
  }

  // get all black list emails
  getAllBlackListEmails(): Promise<ContactFormBlackList[]> {
    return this.fs.collection('contact-form/black-list/blocked-emails',
      ref => ref.orderBy('seqNo', 'desc')).valueChanges().pipe(first()).toPromise();
  }

  // delete selected email
  deleteBlackListEmail(email: string) {
    // get the blocked emails number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of emails in the database
        const blackListEmailsCount = res.data().blackListEmailsCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ blackListEmailsCount });

        return this.fs.collection('contact-form/black-list/blocked-emails').doc(email).delete();
      });
  }

  // check if email is blocked
  checkIfEmailBlocked(email: string) {
    return this.fs.firestore.doc(`contact-form/black-list/blocked-emails/${email}`).get();
  }
}
