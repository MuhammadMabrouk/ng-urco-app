import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { UserOrders } from 'src/app/shared/interfaces/user/user-orders';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  constructor(
    private fs: AngularFirestore,
    private globalJs: GlobalJsFunctionsService
  ) { }

  // get single request
  getSingleRequest(requestId: string): Observable<UserOrders> {
    return this.fs.doc(`requests/${requestId}`).valueChanges();
  }

  // change the status of this request
  changeRequestStatus(requestId: string, customerId: string, status: string) {
    let data;

    if (status === 'delivered') {
      data = { status, deliveredDate: this.globalJs.getTimeInSpecificTimezone(undefined, true) };
    } else {
      data = { status };
    }

    return this.fs.doc(`requests/${requestId}`).update(data).then(() => {
      return this.fs.doc(`users/${customerId}/orders/${requestId}`).update(data);
    });
  }
}
