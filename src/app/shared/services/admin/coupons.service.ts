import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Coupons } from 'src/app/shared/interfaces/admin/coupons';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  constructor(
    private fs: AngularFirestore,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) { }

  // add new coupon
  addNewCoupon(data: Coupons) {
    // get the saved coupons count then save the new coupon
    return this.fs.firestore.collection('coupons').get().then(snap => {

      // store the new coupons count in database
      const couponsCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new coupon
          const saveNewCoupon = this.fs.collection('coupons').add(data);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ couponsCount }).then(() => saveNewCoupon);
          } else {
            return generalInfoDoc.update({ couponsCount }).then(() => saveNewCoupon);
          }
        });
    });
  }

  // get all coupons
  getCoupons(): Promise<Coupons[]> {
    return this.fs.collection('coupons', ref => ref.orderBy('seqNo', 'desc')).valueChanges().pipe(first()).toPromise();
  }

  // get data of the edited coupon
  getEditedCoupon(couponId: string) {
    return this.fs.collection('coupons').doc(couponId).ref.get();
  }

  // edit selected coupon
  editCoupon(id: string, data: Coupons) {
    return this.fs.collection('coupons').doc(id).update(data);
  }

  // delete selected coupon
  deleteCoupon(id: string) {
    // get the coupons number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of coupons in the database
        const couponsCount = res.data().couponsCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ couponsCount });

        return this.fs.collection('coupons').doc(id).delete();
      });
  }

  // apply promotion code discount on submit
  applyCouponDiscount(id: string) {
    return this.fs.firestore.collection('coupons').doc(id).get().then(coupon => {

      const ref = this.fs.collection('coupons').doc(id);
      const data: Coupons = coupon.data();
      const todayDate = String(this.globalJs.getTimeInSpecificTimezone(this.generalSettingsSer.generalSettings.timeZone.zone, true)).split('/');
      const todayDateObj = { day: +todayDate[0], month: +todayDate[1], year: +todayDate[2] };
      const ExpDate = data.ExpDate;
      let ExpDateObj: { day: number; month: number; year: number; };

      if (ExpDate) {
        ExpDateObj = { day: ExpDate.day, month: ExpDate.month, year: ExpDate.year };
      }

      if (data.enabled) {
        // coupon in available date
        if (!ExpDate || this.globalJs.calcDaysBetweenDates(ExpDateObj, todayDateObj) >= 0) {

          return data;

        } else {
          // the coupon is expired
          ref.update({ enabled: false });
        }
      }
    });
  }

  // calc the number of uses for this coupon
  calcCouponUsesNo(id: string) {
    this.fs.firestore.collection('coupons').doc(id).get().then(res => {

      const ref = this.fs.collection('coupons').doc(id);
      const data: Coupons = res.data();

      if (data.enabled) {
        // if this use is less than the allowed limit for this coupon
        if (data.usesLimit !== 0 && data.usesNo < data.usesLimit - 1) {

          ref.update({ usesNo: data.usesNo + 1 });

          // if this is the last use of this coupon
        } else if (data.usesLimit !== 0 && data.usesNo === data.usesLimit - 1) {

          ref.update({ usesNo: data.usesNo + 1, enabled: false });

          // if the coupon has an unlimited uses number
        } else if (data.usesLimit === 0) {

          ref.update({ usesNo: data.usesNo + 1 });
        }
      }
    });
  }
}
