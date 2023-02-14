import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Cart } from 'src/app/shared/interfaces/goods/cart';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(
    private translateSer: TranslateService,
    private fs: AngularFirestore,
    private mainLoadingSer: MainLoadingService,
    private authSer: AuthService,
    private storageSer: StorageService,
    private notifySer: NotificationsService,
    private router: Router
  ) {}

  // get cart goods to show its length in navbar
  getCartGoods(userId: string) {
    return this.fs.collection(`users/${userId}/cart`).snapshotChanges();
  }

  // get the data of cart goods
  getCartGoodsData() {

    let goodsIDs: string[] = [];
    const goodsData: Cart[] = [];

    return new Promise((getGoodsData) => {

      if (this.authSer.isLoggedIn) {
        // get docs data from 'cart' collection and store it in arrays
        this.fs.firestore.collection(`users/${this.authSer.userId}/cart`).get().then(querySnapshot => {
          querySnapshot.forEach(doc => {
            goodsIDs.push(doc.id);
            goodsData.push({
              seqNo: doc.data().seqNo,
              size: doc.data().size,
              qty: doc.data().qty
            });
          });

          // use 'goodsIDs' array to get the real goods data from 'goods' collection
          const getDocs = goodsIDs.map((id: string) => {
            return this.fs.firestore.collection('goods').doc(id).get()
              .then((docData) => {
                return docData.data();
              });
          });

          // replace the 'seqNo' and 'qty' properties of the real goods with the properties of the goods in the 'cart' collection
          Promise.all(getDocs).then((goods: Cart[]) => {
            for (let i = 0; i < goods.length; i++) {
              goods[i].seqNo = goodsData[i].seqNo;
              goods[i].size = goodsData[i].size;
              goods[i].qty = goodsData[i].qty;
            }

            // sort the array by the sequential number
            goods.sort((a, b) => {
              return a.seqNo - b.seqNo;
            }).reverse();
            getGoodsData(goods);
          });
        });

      } else {

        const cartData = localStorage.getItem('cartData');
        if (cartData) {
          // get 'cart' data from the local storage and store it in arrays
          const goods = JSON.parse(cartData);
          for (const good of goods) {
            goodsIDs.push(good.id);
            goodsData.push({
              seqNo: good.seqNo,
              size: good.size,
              qty: good.qty
            });
          }
        } else {
          goodsIDs = [];
        }

        // use 'goodsIDs' array to get the real goods data from 'goods' collection
        const getDocs = goodsIDs.map((id: string) => {
          return this.fs.firestore.collection('goods').doc(id).get()
            .then((docData) => {
              return docData.data();
            });
        });

        // replace the 'seqNo' and 'qty' properties of the real goods with the properties of the goods in the 'cart' collection
        Promise.all(getDocs).then((goods: Cart[]) => {
          for (let i = 0; i < goods.length; i++) {
            goods[i].seqNo = goodsData[i].seqNo;
            goods[i].size = goodsData[i].size;
            goods[i].qty = goodsData[i].qty;
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

  // add selected good to cart
  addToCart(data: Cart, redirectToCart: boolean = false) {

    // check if the user is registered or a guest
    if (this.authSer.isLoggedIn) { // if registered

      this.mainLoadingSer.startLoading();
      this.fs.firestore.doc(`users/${this.authSer.userId}/cart/${data.id}`).get()
        .then(doc => {
          // check if the selected good is exist or not
          if (!doc.exists) {
            this.mainLoadingSer.endLoading();

            this.fs.collection(`users/${this.authSer.userId}/cart`).doc(data.id).set(data).then(() => {
              // redirect to the 'shopping-cart' page
              if (redirectToCart) {
                this.router.navigate(['/shopping-cart']);
              }
            });

          } else {
            this.mainLoadingSer.endLoading();
            this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
          }
        })
        .catch(() => {
          this.mainLoadingSer.endLoading();
        });

    } else { // if a guest

      const cartData = localStorage.getItem('cartData');

      if (cartData) {
        const oldCart = JSON.parse(cartData);

        // check if the selected good is exist or not
        if (!oldCart.some(e => e.id === data.id)) {
          oldCart.push(data);
          this.storageSer.setItem('cartData', oldCart).subscribe(() => {
            // redirect to the 'shopping-cart' page
            if (redirectToCart) {
              this.router.navigate(['/shopping-cart']);
            }
          });

        } else {
          this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
        }
      } else {
        this.storageSer.setItem('cartData', [data]).subscribe(() => {
          // redirect to the 'shopping-cart' page
          if (redirectToCart) {
            this.router.navigate(['/shopping-cart']);
          }
        });
      }
    }
  }

  // add all to cart from wishlist
  addAllToCart(data: Cart[]) {
    if (this.authSer.isLoggedIn) {

      this.mainLoadingSer.startLoading();
      data.forEach((good: Cart) => {
        this.fs.firestore.doc(`users/${this.authSer.userId}/cart/${good.id}`).get()
          .then(doc => {
            // check if the selected good is exist or not
            if (!doc.exists) {
              this.mainLoadingSer.endLoading();
              return this.fs.collection(`users/${this.authSer.userId}/cart`).doc(good.id).set(good);
            } else {
              this.mainLoadingSer.endLoading();
              this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
            }
          })
          .catch(() => {
            this.mainLoadingSer.endLoading();
          });
      });

    } else {

      const cartData = localStorage.getItem('cartData');
      if (cartData) {
        const oldCart = JSON.parse(cartData);
        data.forEach((good: Cart) => {
          // check if the selected good is exist or not
          if (!oldCart.some(e => e.id === good.id)) {
            oldCart.push(good);
            this.storageSer.setItem('cartData', oldCart).subscribe();
          } else {
            this.notifySer.setNotify({class: 'danger', msg: this.translateSer.instant('toast-notifications.product-exist'), time: 5000});
          }
        });
      } else {
        this.storageSer.setItem('cartData', data).subscribe();
      }
    }
  }

  // send cart from localStorage to database after sign in
  addToCartFromLocalStorage(goods: Array<Cart>) {

    const db = this.fs.firestore;

    // Begin a new batch
    const batch = db.batch();

    // Set each document, as part of the batch
    goods.forEach((good: Cart) => {
      batch.set(db.collection(`users/${this.authSer.userId}/cart`).doc(good.id), good);
    });

    // Commit the entire batch
    return batch.commit().then(() => {
      this.storageSer.removeItem('cartData');
    });
  }

  // delete selected item from cart
  deleteCartItem(id: string) {
    return this.fs.collection(`users/${this.authSer.userId}/cart`).doc(id).delete();
  }

  // update qty of selected item in cart
  updateQty(id: string, newValue: number) {
    return this.fs.collection(`users/${this.authSer.userId}/cart`).doc(id).update({ qty: newValue });
  }
}
