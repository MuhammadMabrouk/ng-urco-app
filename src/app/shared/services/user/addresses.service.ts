import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserAddresses } from 'src/app/shared/interfaces/user/user-addresses';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AddressesService {

  constructor(
    private fs: AngularFirestore,
    private authSer: AuthService
  ) {}

  // add new address
  addNewAddress(data: UserAddresses) {
    // check if the added address is exist or not
    return this.fs.firestore.doc(`users/${this.authSer.userId}/addresses/${data.addressTitle}`).get().then(doc => {
      if (!doc.exists) {

        // get the number of documents in the collection
        return this.fs.firestore.collection(`users/${this.authSer.userId}/addresses`).get().then(snap => {

          // store addresses count in database
          const addressesCount = snap.size + 1;

          return this.fs.firestore.doc(`users/${this.authSer.userId}/dashboard/generalInfo`).get()
            .then(infoDoc => {

              // generalInfo doc path
              const generalInfoDoc = this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo');
              // save the new address
              const saveNewAddress = this.fs.collection(`users/${this.authSer.userId}/addresses`).doc(data.addressTitle).set(data);

              // check if the 'generalInfo' doc is exist or not
              if (!infoDoc.exists) {
                return generalInfoDoc.set({ addressesCount }).then(() => saveNewAddress);
              } else {
                return generalInfoDoc.update({ addressesCount }).then(() => saveNewAddress);
              }
            });
        });

      } else {
        throw null;
      }
    });
  }

  // get all addresses
  getAddresses(userId: string): Promise<UserAddresses[]> {
    return this.fs.collection(`users/${userId}/addresses`, ref => ref.orderBy('seqNo')).valueChanges().pipe(first()).toPromise();
  }

  // get data of the edited address
  getEditedAddress(userId: string, addressId: string) {
    return this.fs.collection(`users/${userId}/addresses`).doc(addressId).ref.get();
  }

  // edit selected address
  editAddress(id: string, data: UserAddresses) {
    return this.fs.collection(`users/${this.authSer.userId}/addresses`).doc(id).update(data);
  }

  // delete selected address
  deleteAddress(id: string) {
    // get the addresses number
    return this.fs.firestore.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').get()
      .then(res => {
        // store new count of addresses in the database
        const addressesCount = res.data().addressesCount - 1;
        this.fs.collection(`users/${this.authSer.userId}/dashboard`).doc('generalInfo').update({ addressesCount });

        return this.fs.collection(`users/${this.authSer.userId}/addresses`).doc(id).delete();
      });
  }
}
