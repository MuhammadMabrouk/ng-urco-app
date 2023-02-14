import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentChangeAction } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { Goods } from 'src/app/shared/interfaces/goods/goods';
import { GoodsSortingMethod } from 'src/app/shared/interfaces/goods/goods-sorting/goods-sorting-method';
import { GoodReview } from 'src/app/shared/interfaces/goods/good-review';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

interface GoodsFilters {
  values: any;
  filterName: string;
}

@Injectable({
  providedIn: 'root'
})
export class GoodsService {

  // store previous filters
  goodsFilters: GoodsFilters[] = [];

  // for product images
  filesRefs: Array<any> = [];
  filesPuts: Array<any> = [];

  constructor(
    private fs: AngularFirestore,
    private storage: AngularFireStorage,
    private authSer: AuthService,
    private userSer: UserService,
    private globalJs: GlobalJsFunctionsService
  ) {}

  // add new good
  addNewGood(data: Goods) {
    // get the saved goods count then save the new good
    return this.fs.firestore.collection('goods').get().then(snap => {

      // store the new goods count in database
      const goodsCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new good
          const saveNewGood = this.fs.collection('goods').add(data);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ goodsCount }).then(() => saveNewGood);
          } else {
            return generalInfoDoc.update({ goodsCount }).then(() => saveNewGood);
          }
        });
    });
  }

  // save the generated id by firebase after saving the good to this good
  saveNewGoodId(id: string) {
    this.fs.collection('goods').doc(id).update({ id });
  }

  // upload product images
  uploadProductImages(files: FileList) {

    // reset array values
    this.filesRefs = [];
    this.filesPuts = [];

    // create array for promises
    const filesPromisesArray: Array<any> = [];

    Array.from(files).forEach((file, index: number) => {
      filesPromisesArray.push(new Promise(resolve => {
        const ref = this.storage.ref(`goods/good_${Date.now()}`);
        const put = ref.put(file);

        this.filesRefs.push(ref);
        this.filesPuts.push(put);

        resolve(put.percentageChanges());
      }));
    });
    return Promise.all(filesPromisesArray);
  }

  // get product images urls
  getProductImagesUrls() {
    const urlsPromisesArray: Array<any> = []; // create array for promises

    this.filesPuts.forEach((put, index) => {
      urlsPromisesArray.push(new Promise(resolve => {
        put.then(() => resolve(this.filesRefs[index].getDownloadURL()));
      }));
    });
    return Promise.all(urlsPromisesArray);
  }

  // delete selected good
  deleteGood(id: string) {
    // get the goods number
    return this.fs.firestore.collection('dashboard').doc('general-info').get()
      .then(res => {
        // store new count of goods in the database
        const goodsCount = res.data().goodsCount - 1;
        this.fs.collection('dashboard').doc('general-info').update({ goodsCount });

        return this.fs.collection('goods').doc(id).delete();
      });
  }

  // delete uploaded product images if they are not saved
  deleteUploadedImages(urls: string[]) {
    return new Promise<void>(() => {
      urls.forEach(url => this.storage.storage.refFromURL(url).delete());
    });
  }

  // get data of the edited good
  getEditedGood(goodId: string) {
    return this.fs.collection('goods').doc(goodId).ref.get();
  }

  // edit selected good
  editGood(id: string, data: Goods) {
    return this.fs.collection('goods').doc(id).update(data);
  }

  // get single good
  getSingleGood(id: string) {
    return this.fs.firestore.doc(`goods/${id}`).get();
  }

  // get goods data
  getGoods(
    values?: any,
    lastGood?: any,
    filterName?: string,
    clearedFilterName?: string,
    sortingMethod?: GoodsSortingMethod,
    limit?: number
  ) {

    // store previous filtering methods to merge new methods with them
    if (values && filterName && !clearedFilterName) {
      const oldExistingFilter = this.goodsFilters.filter(obj => obj.filterName === filterName);

      // check whether this filtering method exists or not
      if (oldExistingFilter.length) {
        oldExistingFilter[0].values = values;
      } else {
        this.goodsFilters.push({ values, filterName });
      }

      // remove the cleared filter method
    } else {
      const removedFilterMethod = this.goodsFilters.filter(obj => obj.filterName === clearedFilterName);
      const removedFilterMethodIndex = this.goodsFilters.indexOf(removedFilterMethod[0]);

      // remove this filtering method if exists
      if (removedFilterMethod.length) {
        this.goodsFilters.splice(removedFilterMethodIndex, 1);
      }
    }

    // if the filter type is "categories," specify its level to
    // determine which field to use for the filtering process
    let categoryFilterField: string;
    let categoryValues;
    this.goodsFilters.find(obj => {
      if (obj.filterName === 'categoriesFilter') {
        categoryValues = obj.values;

        // check if the categories filter is one or two levels
        if (typeof categoryValues === 'string') { // one level filter
          categoryFilterField = 'mainCatSlug';

        } else if (typeof categoryValues === 'object') { // two levels filter
          categoryFilterField = 'category';
        }
      }
    });

    // default state or single filter
    if (!this.goodsFilters.length || this.goodsFilters.length === 1) {
      if (!this.goodsFilters.length) {

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

        // initial query, no filters
        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref => ref.orderBy(sorting.filed, sorting.sortingDir).limit(limit + 1)).snapshotChanges();

      } else if (this.goodsFilters[0].filterName === 'categoriesFilter') {

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

        // categories filter
        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where(categoryFilterField, '==', this.goodsFilters[0].values)
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
          .where(categoryFilterField, '==', this.goodsFilters[0].values)
          .limit(limit + 1)
        ).snapshotChanges();

      } else if (this.goodsFilters[0].filterName === 'priceFilterForm') {

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

        // price filter
        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', this.goodsFilters[0].values.price[0])
            .where('priceAfterDiscount', '<=', this.goodsFilters[0].values.price[1])
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
          .where('priceAfterDiscount', '>=', this.goodsFilters[0].values.price[0])
          .where('priceAfterDiscount', '<=', this.goodsFilters[0].values.price[1])
          .limit(limit + 1)
        ).snapshotChanges();

      } else if (this.goodsFilters[0].filterName === 'colorFilterForm') {

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

        // color filter
        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('color', '==', this.goodsFilters[0].values.color)
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
          .where('color', '==', this.goodsFilters[0].values.color)
          .limit(limit + 1)
        ).snapshotChanges();

      } else if (this.goodsFilters[0].filterName === 'rateFilterForm') {

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

        // rate filter
        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('rating', '==', +this.goodsFilters[0].values.rate)
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
          .where('rating', '==', +this.goodsFilters[0].values.rate)
          .limit(limit + 1)
        ).snapshotChanges();
      }

    } else { // multiple filters together

      if (this.goodsFilters.length === 2) { // two filters together
        if (this.goodsFilters.every(obj => ['priceFilterForm', 'categoriesFilter'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where(categoryFilterField, '==', categoryValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where(categoryFilterField, '==', categoryValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['priceFilterForm', 'colorFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where('color', '==', colorValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where('color', '==', colorValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['priceFilterForm', 'rateFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where('rating', '==', +rateValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where('rating', '==', +rateValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['colorFilterForm', 'rateFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('color', '==', colorValues)
              .where('rating', '==', +rateValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('color', '==', colorValues)
            .where('rating', '==', +rateValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['colorFilterForm', 'categoriesFilter'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('color', '==', colorValues)
              .where(categoryFilterField, '==', categoryValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('color', '==', colorValues)
            .where(categoryFilterField, '==', categoryValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['rateFilterForm', 'categoriesFilter'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('rating', '==', +rateValues)
              .where(categoryFilterField, '==', categoryValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('rating', '==', +rateValues)
            .where(categoryFilterField, '==', categoryValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

      } else if (this.goodsFilters.length === 3) { // three filters together

        if (this.goodsFilters.every(obj => ['priceFilterForm', 'categoriesFilter', 'colorFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where(categoryFilterField, '==', categoryValues)
              .where('color', '==', colorValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where(categoryFilterField, '==', categoryValues)
            .where('color', '==', colorValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['priceFilterForm', 'categoriesFilter', 'rateFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where(categoryFilterField, '==', categoryValues)
              .where('rating', '==', +rateValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where(categoryFilterField, '==', categoryValues)
            .where('rating', '==', +rateValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['priceFilterForm', 'rateFilterForm', 'colorFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
              ref.orderBy(sorting.filed, sorting.sortingDir)
              .where('priceAfterDiscount', '>=', priceValues[0])
              .where('priceAfterDiscount', '<=', priceValues[1])
              .where('color', '==', colorValues)
              .where('rating', '==', +rateValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where('color', '==', colorValues)
            .where('rating', '==', +rateValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

        if (this.goodsFilters.every(obj => ['colorFilterForm', 'categoriesFilter', 'rateFilterForm'].includes(obj.filterName))) {

          // check if there is a sort method, otherwise use the default
          const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'seqNo', sortingDir: 'desc' };

          // filter methods order is unknown, so I'm searching in the arrays for the correct value
          const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;
          const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

          if (lastGood) {
            return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
              .where(categoryFilterField, '==', categoryValues)
              .where('color', '==', colorValues)
              .where('rating', '==', +rateValues)
              .startAfter(lastGood)
              .limit(limit + 1)
            ).snapshotChanges();
          }
          return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
            .where(categoryFilterField, '==', categoryValues)
            .where('color', '==', colorValues)
            .where('rating', '==', +rateValues)
            .limit(limit + 1)
          ).snapshotChanges();
        }

      } else if (this.goodsFilters.length === 4) { // four filters together

        // check if there is a sort method, otherwise use the default
        const sorting: GoodsSortingMethod = (sortingMethod) ? sortingMethod : { filed: 'priceAfterDiscount', sortingDir: 'desc' };

        // filter methods order is unknown, so I'm searching in the arrays for the correct value
        const priceValues = this.goodsFilters.find(obj => obj.values.price).values.price;
        const colorValues = this.goodsFilters.find(obj => obj.values.color).values.color;
        const rateValues = this.goodsFilters.find(obj => obj.values.rate).values.rate;

        if (lastGood) {
          return this.fs.collection('goods', ref =>
            ref.orderBy(sorting.filed, sorting.sortingDir)
            .where('priceAfterDiscount', '>=', priceValues[0])
            .where('priceAfterDiscount', '<=', priceValues[1])
            .where(categoryFilterField, '==', categoryValues)
            .where('color', '==', colorValues)
            .where('rating', '==', +rateValues)
            .startAfter(lastGood)
            .limit(limit + 1)
          ).snapshotChanges();
        }
        return this.fs.collection('goods', ref =>
          ref.orderBy(sorting.filed, sorting.sortingDir)
          .where('priceAfterDiscount', '>=', priceValues[0])
          .where('priceAfterDiscount', '<=', priceValues[1])
          .where(categoryFilterField, '==', categoryValues)
          .where('color', '==', colorValues)
          .where('rating', '==', +rateValues)
          .limit(limit + 1)
        ).snapshotChanges();
      }
    }
  }

  // get new arrivals goods data
  getNewArrivalsGoods() {
    return this.fs.collection('goods', ref => ref.orderBy('seqNo', 'desc').limit(10)).snapshotChanges();
  }

  // get featured goods data
  getFeaturedGoods() {
    return this.fs.collection('goods', ref =>
      ref.orderBy('rating', 'desc')
      .where('rating', '<=', 5)
      .limit(10)
    ).snapshotChanges();
  }

  // get current user review for this good
  getUserReviewForThisGood(goodId: string): Promise<GoodReview> {
    return this.fs.doc<GoodReview>(`goods/${goodId}/reviews/${this.authSer.userId}`).valueChanges().pipe(first()).toPromise();
  }

  // add good review
  addGoodReview(data: GoodReview) {
    const userName = this.userSer.userInfo.displayName;
    const userInitials = userName.split(' ').map(word => word[0]).join('');
    const userImg = this.userSer.userInfo.profilePicture;
    const userImgUrl = userImg ? userImg.url : '';

    const review: GoodReview = {
      seqNo: Date.now(),
      goodId: data.goodId,
      rating: data.rating,
      comment: data.comment,
      date: this.globalJs.getTimeInSpecificTimezone(undefined, true) as string,
      userId: this.authSer.userId,
      userName,
      userInitials,
      userImg: userImgUrl
    };

    return this.fs.doc(`goods/${data.goodId}/reviews/${this.authSer.userId}`).set(review);
  }

  // get all rates of this good
  getGoodAllRates(goodId: string): Promise<GoodReview[]> {
    return this.fs.collection(`goods/${goodId}/reviews`).valueChanges().pipe(first()).toPromise();
  }

  // get the reviews of this good
  getGoodReviews(goodId: string, limit: number, lastReview?: any): Observable<DocumentChangeAction<GoodReview>[]> {
    return this.fs.collection(`goods/${goodId}/reviews`, ref =>
      (lastReview) ?
        ref.orderBy('seqNo', 'desc').startAfter(lastReview).limit(limit + 1) :
        ref.orderBy('seqNo', 'desc').limit(limit + 1)
    ).snapshotChanges();
  }

  // update rating score of this good
  updateGoodRating(goodId: string, rating: number) {
    return this.fs.doc(`goods/${goodId}`).update({rating});
  }
}
