import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MainSlider } from 'src/app/shared/interfaces/goods/main-slider';

@Injectable({
  providedIn: 'root'
})
export class MainSliderService {

  constructor(private fs: AngularFirestore) { }

  // get the goods data of the main slider
  getMainSliderGoodsData() {

    const goodsData: MainSlider[] = [];

    return new Promise<MainSlider[]>(getGoodsData => {

      // get docs data from 'main-slider' collection and store it in 'goodsData' array
      this.fs.firestore.collection('main-slider').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          goodsData.push({
            id: doc.data().id,
            seqNo: doc.data().seqNo
          });
        });

        // use the stored ids to get the real goods data from 'goods' collection
        const getDocs = goodsData.map((good: MainSlider) => {
          return this.fs.firestore.collection('goods').doc(good.id).get()
            .then((docData) => docData.data());
        });

        // replace the 'seqNo' property of the real goods with the new one of the goods in the 'main-slider' collection
        Promise.all(getDocs).then((goods: MainSlider[]) => {
          for (let i = 0; i < goods.length; i++) {
            goods[i].seqNo = goodsData[i].seqNo;
          }

          // sort the array by the sequential number
          goods.sort((a, b) => a.seqNo - b.seqNo);

          getGoodsData(goods.reverse());
        });
      });
    });
  }

  // add new good
  addNewGood(data: MainSlider) {
    return this.fs.collection('main-slider').doc(data.id).set(data);
  }

  // delete the good
  deleteGood(id: string) {
    return this.fs.collection('main-slider').doc(id).delete();
  }
}
