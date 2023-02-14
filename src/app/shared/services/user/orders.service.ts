import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { CartService } from 'src/app/shared/services/goods/cart.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { UserOrders } from 'src/app/shared/interfaces/user/user-orders';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(
    private fs: AngularFirestore,
    private authSer: AuthService,
    private userSer: UserService,
    private cartSer: CartService,
    private generalSettingsSer: GeneralSettingsService,
    private globalJs: GlobalJsFunctionsService
  ) {}

  // add new order
  addNewOrder(address: string, total: number) {
    return this.cartSer.getCartGoodsData().then((goods: Goods[]) => {

      // get the number of documents in the collection
      this.fs.firestore.collection(`users/${this.authSer.userId}/orders`).get().then(snap => {

        const ordersCount = snap.size + 1;

        // store orders count in database
        this.fs.firestore.doc(`users/${this.authSer.userId}/dashboard/generalInfo`).get()
          .then(doc => {
            // check if the 'generalInfo' doc is exist or not
            if (!doc.exists) {
              this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').set({ ordersCount });
            } else {
              this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').update({ ordersCount });
            }
          });

        // set the order data
        const date = this.globalJs.getTimeInSpecificTimezone(this.generalSettingsSer.generalSettings.timeZone.zone);
        const time = (date as Date).toTimeString().split(' ')[0].split(':');
        const orderData: UserOrders = {
          seqNo: Date.now(),
          placedDate: (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string),
          placedTime: time[0] + ':' + time[1],
          address,
          status: 'ordered',
          total
        };

        this.fs.collection(`users/${this.authSer.userId}/orders`).add(orderData).then(ref => {

          // spread all goods data in the added order
          goods.forEach(good => {
            const goodData: Goods = {
              id: good.id,
              seqNo: good.seqNo,
              name: good.name,
              images: good.images,
              price: good.price - (good.price * good.discount),
              size: good.size,
              qty: good.qty,
              total: (good.price - (good.price * good.discount)) * good.qty
            };
            this.fs.collection(`users/${this.authSer.userId}/orders/${ref.id}/orderContent`).doc(good.id).set(goodData);
          });

          // get the number of all requests
          this.fs.firestore.collection('requests').get().then(res => {

            const requestsCount = res.size + 1;

            // store requests count in database
            this.fs.firestore.doc('dashboard/general-info').get().then(doc => {

              // general-info doc path
              const generalInfoDoc = this.fs.doc('dashboard/general-info');

              // get the customer info and save the new request
              this.userSer.getUserInfo().then(info => {
                orderData.customerId = info.id;
                orderData.customerName = info.displayName;
                orderData.customerEmail = info.email || 'N/A';
                orderData.customerCountry = info.country || 'N/A';
                orderData.customerGender = info.gender || 'N/A';

                // save the new request
                const saveNewRequest = this.fs.collection('requests').doc(ref.id).set(orderData);

                // check if the 'general-info' doc is exist or not
                if (!doc.exists) {
                  generalInfoDoc.set({ requestsCount }).then(() => saveNewRequest);
                } else {
                  generalInfoDoc.update({ requestsCount }).then(() => saveNewRequest);
                }
              });
            });
          });
        });

        // delete all goods in the shopping cart
        this.globalJs.deleteAllDocs(`users/${this.authSer.userId}/cart`);
      });
    });
  }

  // get single order
  getSingleOrder(userId: string, orderId: string) {
    return this.fs.firestore.doc(`users/${userId}/orders/${orderId}`).get();
  }

  // get single order content
  getSingleOrderContent(userId: string, orderId: string): Observable<Goods[]> {
    const path = `users/${userId}/orders/${orderId}/orderContent`;
    return this.fs.collection(path, ref => ref.orderBy('seqNo', 'desc')).valueChanges();
  }

  // cancel the order
  cancelOrder(orderId: string) {
    return this.fs.doc(`requests/${orderId}`).update({ status: 'canceled' }).then(() => {
      return this.fs.doc(`users/${this.authSer.userId}/orders/${orderId}`).update({ status: 'canceled' });
    });
  }

  // remove a good from the order
  removeGoodFromOrder(orderId: string, goodId: string) {
    const orderContentRef = `users/${this.authSer.userId}/orders/${orderId}/orderContent`;

    // remove this good from the order
    return this.fs.collection(orderContentRef).doc(goodId).delete().then(() => {

      // check if the order is now empty after deleting this good
      return this.fs.firestore.collection(orderContentRef).get().then(snap => {
        if (snap.empty) {
          // now the order is empty so cancel it
          return this.fs.doc(`requests/${orderId}`).update({ status: 'canceled' }).then(() => {
            return this.fs.doc(`users/${this.authSer.userId}/orders/${orderId}`).update({ status: 'canceled' });
          });
        }
      });
    })
    .catch(err => console.log(err));
  }
}
