import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ReturnGoods } from 'src/app/shared/interfaces/goods/return-goods';

@Injectable({
  providedIn: 'root'
})
export class AdminReturnsService {

  constructor(private fs: AngularFirestore) { }

  // add returned good
  addReturnedGood(data: ReturnGoods) {
    // get the saved returned goods count then save the new good
    return this.fs.firestore.collection('returns').get().then(snap => {

      // store the new returned goods count in database
      const returnedGoodsCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new good
          const saveNewReturnedGood = this.fs.collection('returns').add(data);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ returnedGoodsCount }).then(() => saveNewReturnedGood);
          } else {
            return generalInfoDoc.update({ returnedGoodsCount }).then(() => saveNewReturnedGood);
          }
        });
    });
  }

  // get this returned good data
  getSingleReturnedGood(returnedGoodId: string) {
    return this.fs.firestore.doc(`returns/${returnedGoodId}`).get();
  }
}
