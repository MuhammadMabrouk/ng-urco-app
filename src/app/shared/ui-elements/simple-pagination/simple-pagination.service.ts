import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { GeneralSettingsService } from 'src/app/shared/services/admin/general-settings.service';
import { SimplePagination } from 'src/app/shared/ui-elements/simple-pagination/simple-pagination';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SimplePaginationService {

  // simple pagination options
  spOptions: SimplePagination = {
    // items count
    allItemsCount: 0,
    viewItemsCountStart: 1,
    viewItemsCountEnd: 0,
    // page number in the browser url
    pageNumber: 1
  };

  constructor(
    private fs: AngularFirestore,
    private authSer: AuthService,
    private mainLoadingSer: MainLoadingService,
    private generalSettingsSer: GeneralSettingsService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  // get items count from database
  getItemsCount(itemsName: string, userDashboard: boolean = false) {
    this.mainLoadingSer.startLoading();

    const countingItemsFunc = (res: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => {
      this.spOptions.allItemsCount = res.data()[`${itemsName}Count`];
      this.spOptions.viewItemsCountStart = 1;
      this.spOptions.viewItemsCountEnd =
        this.spOptions.allItemsCount > this.generalSettingsSer.generalSettings[`${itemsName}Limit`] ?
        this.generalSettingsSer.generalSettings[`${itemsName}Limit`] : this.spOptions.allItemsCount;
      // reset values
      this.spOptions.pageNumber = 1;
      this.spOptions.hasPrevPage = false;
    };

    if (!userDashboard) { // for items in admin dashboard

      // wait for 'generalSettings' until it is set
      if (this.generalSettingsSer.generalSettings) {

        this.fs.firestore.collection('dashboard').doc('general-info').get()
          .then(res => {
            countingItemsFunc(res);
            this.mainLoadingSer.endLoading();
          })
          .catch(() => { this.mainLoadingSer.endLoading(); });

      } else {
        setTimeout(() => {
          this.getItemsCount(itemsName, userDashboard);
        }, 250);
      }

    } else { // for items in user dashboard

      // wait for user id until it is set
      const userId = this.authSer.userId;

      if (typeof userId !== 'undefined' && this.generalSettingsSer.generalSettings) {

        this.fs.firestore.collection(`users/${userId}/dashboard`).doc('generalInfo').get()
          .then(res => {
            countingItemsFunc(res);
            this.mainLoadingSer.endLoading();
          })
          .catch(() => { this.mainLoadingSer.endLoading(); });

      } else {
        setTimeout(() => {
          this.getItemsCount(itemsName, userDashboard);
        }, 250);
      }
    }
  }

  // changes when go to next page
  changesWhenGoToNextPage(relativeTo: ActivatedRoute, limit: number, optional: boolean = false) {
    // increase page number in the browser url
    this.spOptions.pageNumber = this.spOptions.pageNumber + 1;

    if (!optional) {
      this.router.navigate([`page/${this.spOptions.pageNumber}`], { relativeTo });
    } else {
      this.router.navigate([], { relativeTo: this.activeRoute, queryParams: { page: this.spOptions.pageNumber } });
    }

    // increase items count
    this.spOptions.viewItemsCountStart = this.spOptions.viewItemsCountStart + limit;
    if (
      this.spOptions.viewItemsCountEnd < this.spOptions.allItemsCount
      && this.spOptions.allItemsCount - this.spOptions.viewItemsCountEnd >= limit
    ) {
      this.spOptions.viewItemsCountEnd = this.spOptions.viewItemsCountEnd + limit;
    } else {
      this.spOptions.viewItemsCountEnd = this.spOptions.allItemsCount;
    }
  }

  // changes when go to prev page
  changesWhenGoToPrevPage(relativeTo: ActivatedRoute, limit: number, optional: boolean = false) {
    // decrease page number in the browser url
    this.spOptions.pageNumber = this.spOptions.pageNumber - 1;

    if (!optional) {
      this.router.navigate([`page/${this.spOptions.pageNumber}`], { relativeTo });
    } else {
      this.router.navigate([], { relativeTo: this.activeRoute, queryParams: { page: this.spOptions.pageNumber } });
    }

    // decrease items count
    this.spOptions.viewItemsCountStart = this.spOptions.viewItemsCountStart - limit;

    if (
      this.spOptions.viewItemsCountEnd < this.spOptions.allItemsCount
      && this.spOptions.viewItemsCountEnd - limit >= limit
    ) {
      this.spOptions.viewItemsCountEnd = this.spOptions.viewItemsCountEnd - limit;

    } else if (this.spOptions.viewItemsCountEnd === this.spOptions.allItemsCount) {

      if (this.spOptions.allItemsCount % limit > 0) {

        this.spOptions.viewItemsCountEnd = this.spOptions.viewItemsCountEnd - this.spOptions.allItemsCount % limit;

      } else {
        this.spOptions.viewItemsCountEnd = this.spOptions.viewItemsCountEnd - limit;
      }

    } else {
      this.spOptions.viewItemsCountEnd = limit - this.spOptions.viewItemsCountEnd;
    }
  }

  // toggle navigation buttons status
  toggleNavigationBtnsStatus(
    getItemsFuncResponse: any,
    itemsPlusOne: object[],
    limit: number,
    isInGetNextItemsPageFunc: boolean = false,
    isInGetPrevItemsPageFunc: boolean = false,
    isLastItemInLastPageDeleted: boolean = false
  ) {

    // in 'getItems' or 'getNextItemsPage' functions
    if (!isInGetPrevItemsPageFunc) {

      // enable prev page button after going to next page
      if (isInGetNextItemsPageFunc) { this.spOptions.hasPrevPage = true; }

      if (itemsPlusOne.length > limit) {
        // remove the excess item
        itemsPlusOne.pop();
        // get the last item of the currently viewed page
        this.spOptions.lastItem = getItemsFuncResponse[getItemsFuncResponse.length - 2].payload.doc;
        this.spOptions.hasNextPage = true;
      } else {
        // get the last item of the currently viewed page
        this.spOptions.lastItem = getItemsFuncResponse[getItemsFuncResponse.length - 1].payload.doc;
        this.spOptions.hasNextPage = false;
      }

      // in 'getPrevItemsPage' function
    } else {

      // check if the last item was deleted on the last page
      if (isLastItemInLastPageDeleted) {
        this.spOptions.hasNextPage = false;
      } else {
        this.spOptions.hasNextPage = true;
      }

      if (itemsPlusOne.length > limit) {
        // remove the excess item
        itemsPlusOne.shift();
        // get the first item of the currently viewed page
        this.spOptions.firstItem = getItemsFuncResponse[1].payload.doc;
        this.spOptions.hasPrevPage = true;
      } else {
        // get the first item of the currently viewed page
        this.spOptions.firstItem = getItemsFuncResponse[0].payload.doc;
        this.spOptions.hasPrevPage = false;
      }

    }
  }

  // get items within the specified limit
  getItems(path: string, limit: number, userId?: string) {
    let finalPath: string;

    if (!userId) { // for items in admin dashboard
      finalPath = path;
    } else { // for items in user dashboard
      finalPath = `users/${userId}/${path}`;
    }

    return this.fs.collection(finalPath, ref =>
      ref.orderBy('seqNo', 'desc')
      .limit(limit + 1)
    ).snapshotChanges();
  }

  // get next items page
  getNextItemsPage(path: string, limit: number, userDB?: boolean) {
    let finalPath: string;

    if (!userDB) { // for items in admin dashboard
      finalPath = path;
    } else { // for items in user dashboard
      finalPath = `users/${this.authSer.userId}/${path}`;
    }

    return this.fs.collection(finalPath, ref =>
      ref.orderBy('seqNo', 'desc')
      .startAfter(this.spOptions.lastItem)
      .limit(limit + 1)
    ).snapshotChanges();
  }

  // get prev items page
  getPrevItemsPage(path: string, limit: number, userDB?: boolean) {
    let finalPath: string;

    if (!userDB) { // for items in admin dashboard
      finalPath = path;
    } else { // for items in user dashboard
      finalPath = `users/${this.authSer.userId}/${path}`;
    }

    return this.fs.collection(finalPath, ref =>
      ref.orderBy('seqNo', 'desc')
      .endBefore(this.spOptions.firstItem)
      .limitToLast(limit + 1)
    ).snapshotChanges();
  }
}
