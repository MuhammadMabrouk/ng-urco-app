import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Wishlist } from 'src/app/shared/interfaces/goods/wishlist';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  productExist: boolean;

  constructor(
    private translateSer: TranslateService,
    private fs: AngularFirestore,
    private mainLoadingSer: MainLoadingService,
    private authSer: AuthService,
    private storageSer: StorageService,
    private notifySer: NotificationsService,
    private globalJs: GlobalJsFunctionsService
  ) {}

  // get wishlist goods to show its length in navbar
  getWishlistGoods(userId: string) {
    return this.fs.collection(`users/${userId}/wishlist`).snapshotChanges();
  }

  // get the data of wishlist goods
  getWishlistGoodsData() {

    let goodsIDs: string[] = [];
    const goodsData: Wishlist[] = [];

    return new Promise((getGoodsData) => {

      if (this.authSer.isLoggedIn) {
        // get docs data from 'wishlist' collection and store it in arrays
        this.fs.firestore.collection(`users/${this.authSer.userId}/wishlist`).get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            goodsIDs.push(doc.id);
            goodsData.push({
              size: doc.data().size,
              qty: doc.data().qty,
              seqNo: doc.data().seqNo
            });
          });

          // use 'goodsIDs' array to get the real goods data from 'wishlist' collection
          const getDocs = goodsIDs.map((id: string) => {
            return this.fs.firestore.collection('goods').doc(id).get()
              .then((docData) => {
                return docData.data();
              });
          });

          // replace the 'seqNo' property of the real goods with the property of the goods in the 'wishlist' collection
          Promise.all(getDocs).then((goods: Wishlist[]) => {
            for (let i = 0; i < goods.length; i++) {
              goods[i].size = goodsData[i].size;
              goods[i].qty = goodsData[i].qty;
              goods[i].seqNo = goodsData[i].seqNo;
            }

            // sort the array by the sequential number
            goods.sort((a, b) => {
              return a.seqNo - b.seqNo;
            }).reverse();
            getGoodsData(goods);
          });
        });

      } else {

        const wishlistData = localStorage.getItem('wishlistData');
        if (wishlistData) {
          // get 'wishlist' data from the local storage and store it in arrays
          const goods = JSON.parse(wishlistData);
          for (const good of goods) {
            goodsIDs.push(good.id);
            goodsData.push({
              size: good.size,
              qty: good.qty,
              seqNo: good.seqNo
            });
          }
        } else {
          goodsIDs = [];
        }

        // use 'goodsIDs' array to get the real goods data from 'wishlist' collection
        const getDocs = goodsIDs.map((id: string) => {
          return this.fs.firestore.collection('goods').doc(id).get()
            .then((docData) => {
              return docData.data();
            });
        });

        // replace the 'seqNo' property of the real goods with the property of the goods in the 'wishlist' collection
        Promise.all(getDocs).then((goods: Wishlist[]) => {
          for (let i = 0; i < goods.length; i++) {
            goods[i].size = goodsData[i].size;
            goods[i].qty = goodsData[i].qty;
            goods[i].seqNo = goodsData[i].seqNo;
          }

          // sort the array by the sequential number
          goods.sort((a, b) => {
            return a.seqNo - b.seqNo;
          }).reverse();
          getGoodsData(goods);
        });
      }
    });
  }

  // add selected goods to wishlist
  addToWishlist(data: Wishlist) {

    // check if the user is registered or a guest
    if (this.authSer.isLoggedIn) { // if registered

      this.mainLoadingSer.startLoading();
      this.fs.firestore.doc(`users/${this.authSer.userId}/wishlist/${data.id}`).get()
        .then(docSnapshot => {
          // check if the selected good is exist or not
          if (!docSnapshot.exists) {
            this.mainLoadingSer.endLoading();
            return this.fs.collection(`users/${this.authSer.userId}/wishlist`).doc(data.id).set(data);
          } else {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
          }
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
        });

    } else { // if a guest

      const wishlistData = localStorage.getItem('wishlistData');
      if (wishlistData) {
        const oldWishlist = JSON.parse(wishlistData);
        // check if the selected good is exist or not
        if (!oldWishlist.some(e => e.id === data.id)) {
          oldWishlist.push(data);
          this.storageSer.setItem('wishlistData', oldWishlist).subscribe();
        } else {
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
        }
      } else {
        this.storageSer.setItem('wishlistData', [data]).subscribe();
      }
    }
  }

  // send wishlist from localStorage to database after sign in
  addToWishlistFromLocalStorage(goods: Array<Wishlist>) {

    const db = this.fs.firestore;

    // Begin a new batch
    const batch = db.batch();

    // Set each document, as part of the batch
    goods.forEach((good: Wishlist) => {
      batch.set(db.collection(`users/${this.authSer.userId}/wishlist`).doc(good.id), good);
    });

    // Commit the entire batch
    return batch.commit().then(() => {
      this.storageSer.removeItem('wishlistData');
    });
  }

  // delete selected item from wishlist
  deleteWishlistItem(id: string) {
    return this.fs.collection(`users/${this.authSer.userId}/wishlist`).doc(id).delete();
  }

  // delete all items from the wishlist
  deleteAllWishlistItems() {
    return this.globalJs.deleteAllDocs(`users/${this.authSer.userId}/wishlist`);
  }
}
