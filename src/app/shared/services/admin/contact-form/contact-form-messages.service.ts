import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContactFormMessages } from 'src/app/shared/interfaces/admin/contact-form/contact-form-messages';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactFormMessagesService {

  constructor(private fs: AngularFirestore) { }

  // add new message
  addNewMessage(data: ContactFormMessages) {
    // get the saved messages count then save the new message
    return this.fs.firestore.collection('contact-form/inbox/messages').get().then(snap => {

      // store the new messages count in database
      const messagesCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new message
          const saveNewMessage = this.fs.collection('contact-form/inbox/messages').add(data);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ messagesCount }).then(() => saveNewMessage);
          } else {
            return generalInfoDoc.update({ messagesCount }).then(() => saveNewMessage);
          }
        });
    });
  }

  // get all messages
  getAllMessages(): Promise<ContactFormMessages[]> {
    return this.fs.collection('contact-form/inbox/messages', ref => ref.orderBy('seqNo', 'desc')).valueChanges().pipe(first()).toPromise();
  }

  // get single message
  getSingleMessage(messageId: string) {
    return this.fs.firestore.doc(`contact-form/inbox/messages/${messageId}`).get();
  }

  // set reading date in the database
  setReadingDate(messageId: string, date: string) {
    return this.fs.doc(`contact-form/inbox/messages/${messageId}`).update({ readingDate: date });
  }

  // delete selected message
  deleteMessage(id: string) {
    // get the messages number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of messages in the database
        const messagesCount = res.data().messagesCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ messagesCount });

        return this.fs.collection('contact-form/inbox/messages').doc(id).delete();
      });
  }
}
