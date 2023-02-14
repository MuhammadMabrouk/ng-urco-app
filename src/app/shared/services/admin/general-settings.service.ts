import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GeneralSettings } from 'src/app/shared/interfaces/admin/general-settings';
import { Observable } from 'rxjs';
import countries from 'src/assets/json-files/countries.json';
import timezones from 'src/assets/json-files/timezones.json';
import { Timezone } from 'src/app/shared/interfaces/timezone';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingsService {

  // all general settings stored here
  generalSettings: GeneralSettings;

  // the limit of goods in 'shop' page
  shopGoodsLength: number[] = [12, 15, 18, 21, 24];

  constructor(private fs: AngularFirestore) { }

  // get general settings from the database in first open
  getGeneralSettingsInFirstOpen(): Observable<GeneralSettings> {
    return this.fs.collection('dashboard').doc('general-settings').valueChanges();
  }

  // get general settings from the database
  getGeneralSettings() {
    return this.fs.firestore.collection('dashboard').doc('general-settings').get();
  }

  // update general settings
  updateGeneralSettings(values: any, name: string) {

    // general-settings doc path
    const generalSettingsDoc = this.fs.collection('dashboard').doc('general-settings');
    // new values to set or update it
    let newObject: GeneralSettings;

    if (name === 'generalSettingsForm') {

      newObject = {
        shopGoodsLimit: values.shopGoodsLimit,
        shippingCost: values.shippingCost,
        returnPeriod: values.returnPeriod,
        timeZone: values.timeZone
      };

    } else if (name === 'adminDashboardSettingsForm') {

      newObject = {
        requestsLimit: values.requestsLimit,
        returnsLimit: values.returnsLimit,
        categoriesLimit: values.categoriesLimit,
        goodsLimit: values.goodsLimit,
        usersLimit: values.usersLimit,
        couponsLimit: values.couponsLimit,
        messagesLimit: values.messagesLimit,
        blackListEmailsLimit: values.blackListEmailsLimit,
        newsletterEmailsLimit: values.newsletterEmailsLimit
      };

    } else if (name === 'userDashboardSettingsForm') {

      newObject = {
        ordersLimit: values.ordersLimit,
        addressesLimit: values.addressesLimit,
        paymentMethodsLimit: values.paymentMethodsLimit,
        returnedGoodsLimit: values.returnedGoodsLimit
      };
    }

    // check if the 'general-settings' doc is exist or not
    return this.fs.firestore.doc(`dashboard/general-settings`).get()
      .then(settingsDoc => {

        if (!settingsDoc.exists) {
          return generalSettingsDoc.set(newObject);
        } else {
          return generalSettingsDoc.update(newObject);
        }
      });
  }

  // get all countries
  getAllCountries() {
    return countries;
  }

  // get time zones
  getTimeZones(): Timezone[] {
    return timezones;
  }
}
