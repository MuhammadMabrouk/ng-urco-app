import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserPayments } from 'src/app/shared/interfaces/user/user-payments';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {

  constructor(
    private fs: AngularFirestore,
    private authSer: AuthService
  ) { }

  // add new payment method
  addNewPaymentMethod(data: UserPayments) {
    // check if the added credit card is exist or not
    return this.fs.firestore.doc(`users/${this.authSer.userId}/payments/${data.cardNumber}`).get().then(doc => {
      if (!doc.exists) {

        // get the saved credit cards count then save the new card
        return this.fs.firestore.collection(`users/${this.authSer.userId}/payments`).get().then(snap => {

          // store the new credit cards count in database
          const paymentMethodsCount = snap.size + 1;

          return this.fs.firestore.doc(`users/${this.authSer.userId}/dashboard/generalInfo`).get()
            .then(infoDoc => {

              // generalInfo doc path
              const generalInfoDoc = this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo');
              // save the new credit card
              const saveNewCreditCard = this.fs.collection(`users/${this.authSer.userId}/payments`).doc(data.cardNumber).set(data);

              // check if the 'generalInfo' doc is exist or not
              if (!infoDoc.exists) {
                return generalInfoDoc.set({ paymentMethodsCount }).then(() => saveNewCreditCard);
              } else {
                return generalInfoDoc.update({ paymentMethodsCount }).then(() => saveNewCreditCard);
              }
            });
        });

      } else {
        throw null;
      }
    });
  }

  // get all payment methods
  getPaymentMethods(userId: string): Promise<UserPayments[]> {
    return this.fs.collection(`users/${userId}/payments`, ref => ref.orderBy('seqNo', 'desc')).valueChanges().pipe(first()).toPromise();
  }

  // get data of the edited payment method
  getEditedPaymentMethod(userId: string, methodId: string) {
    return this.fs.collection(`users/${userId}/payments`).doc(methodId).ref.get();
  }

  // edit selected payment method
  editPaymentMethod(id: string, data: UserPayments) {
    return this.fs.collection(`users/${this.authSer.userId}/payments`).doc(id).update(data);
  }

  // delete selected payment method
  deletePaymentMethod(id: string) {
    // get the payment methods number
    return this.fs.firestore.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').get()
      .then(res => {
        // store new count of payment methods in the database
        const paymentMethodsCount = res.data().paymentMethodsCount - 1;
        this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').update({ paymentMethodsCount });

        return this.fs.collection(`users/${this.authSer.userId}/payments`).doc(id).delete();
      });
  }
}
