import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ContactFormSettings } from 'src/app/shared/interfaces/admin/contact-form/contact-form-settings';

@Injectable({
  providedIn: 'root'
})
export class ContactFormSettingsService {

  constructor(private fs: AngularFirestore) { }

  // get contact from settings from the database
  getContactFormSettings() {
    return this.fs.firestore.collection('contact-form').doc('settings').get();
  }

  // update contact form settings
  updateContactFormSettings(values: any) {

    // settings doc path
    const contactSettingsDoc = this.fs.collection('contact-form').doc('settings');
    // new values to set or update it
    const newObject: ContactFormSettings = {
      nameLength: values.nameLength,
      messageLength: values.messageLength,
      subjects: values.subjects
    };

    // check if the 'settings' doc is exist or not
    return this.fs.firestore.doc(`contact-form/settings`).get()
      .then(settingsDoc => {

        if (!settingsDoc.exists) {
          return contactSettingsDoc.set(newObject);
        } else {
          return contactSettingsDoc.update(newObject);
        }
      });
  }
}
