import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MainOffer } from 'src/app/shared/interfaces/goods/main-offer';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainOfferService {

  constructor(private fs: AngularFirestore) { }

  // get the data of the main offer
  getMainOfferData() {
    return this.fs.firestore.collection('main-offer').doc('home-offer').get();
  }

  // get the data of the main offer as observable
  getMainOfferDataAsObservable(): Observable<MainOffer> {
    return this.fs.collection('main-offer').doc('home-offer').valueChanges();
  }

  // get the good data of the main offer
  getMainOfferGood(goodId: string) {
    return this.fs.firestore.collection('goods').doc(goodId).get();
  }

  // add new good
  addNewGood(data: MainOffer) {
    return this.fs.collection('main-offer').doc('home-offer').set(data);
  }

  // delete the good
  deleteGood(id: string) {
    return this.fs.collection('main-offer').doc('home-offer').delete();
  }
}
