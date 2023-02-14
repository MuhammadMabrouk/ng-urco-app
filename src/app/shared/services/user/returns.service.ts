import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { AdminReturnsService } from 'src/app/shared/services/admin/admin-returns.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserOrders } from 'src/app/shared/interfaces/user/user-orders';
import { ReturnDetails } from 'src/app/shared/interfaces/goods/return-details';
import { ReturnGoods } from 'src/app/shared/interfaces/goods/return-goods';
import { Goods } from 'src/app/shared/interfaces/goods/goods';

@Injectable({
  providedIn: 'root'
})
export class ReturnsService {

  constructor(
    private fs: AngularFirestore,
    private authSer: AuthService,
    private adminReturnsSer: AdminReturnsService,
    private globalJs: GlobalJsFunctionsService
  ) { }

  // return good
  returnGood(orderId: string, thisOrder: UserOrders, returnDetails: ReturnDetails) {

    const seqNo = Date.now();
    const today = (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string); // today date in nice format

    const returnedGoodData: ReturnGoods = {
      seqNo,
      userInfo: returnDetails.userInfo,
      good: returnDetails.good,
      reasons: returnDetails.reasons,
      comments: returnDetails.comments,
      placedDate: thisOrder.placedDate,
      deliveredDate: thisOrder.deliveredDate,
      returnedDate: today
    };

    // add this good to user's returns page
    this.adminReturnsSer.addReturnedGood(returnedGoodData);

    // add this good to user's returns page
    return this.fs.collection(`users/${this.authSer.userId}/returns`).add(returnedGoodData)
      .then(() => {
        // get the number of documents in the collection
        this.fs.firestore.collection(`users/${this.authSer.userId}/returns`).get().then(snap => {

          // store returned goods count in database
          const returnedGoodsCount = snap.size;

          this.fs.firestore.doc(`users/${this.authSer.userId}/dashboard/generalInfo`).get()
            .then(infoDoc => {
              // check if the 'generalInfo' doc is exist or not
              if (!infoDoc.exists) {
                this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').set({ returnedGoodsCount });
              } else {
                this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').update({ returnedGoodsCount });
              }
            });
        });

        // mark this good as returned
        const path = `users/${this.authSer.userId}/orders/${orderId}/orderContent`;
        return this.fs.collection(path).doc(returnedGoodData.good.id).update({ returned: true });
      });
  }

  // mark the whole order as returned if all goods inside it is returned
  markOrderAsReturned(orderId: string) {
    const returnAllChecker = [];
    const path = `users/${this.authSer.userId}/orders/${orderId}/orderContent`;

    this.fs.firestore.collection(path).get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          if (doc.data().returned) { returnAllChecker.push(true); } else { returnAllChecker.push(false); }
        });
      })
      .then(() => {
        if (returnAllChecker.every(item => item === true)) {
          this.fs.collection(`users/${this.authSer.userId}/orders`).doc(orderId).update({ status: 'returned' });
          this.fs.collection('requests').doc(orderId).update({ status: 'returned' });
        }
      });
  }
}
