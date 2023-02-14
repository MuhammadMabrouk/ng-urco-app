import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private fs: AngularFirestore) { }

  // get single user
  getSingleUser(userId: string) {
    return this.fs.firestore.doc(`users/${userId}`).get();
  }

  // make this user an admin
  makeAdmin(userId: string) {
    return this.fs.collection('users').doc(userId).update({ isAdmin: true });
  }

  // remove this user from administrators
  removeAdmin(userId: string) {
    return this.fs.collection('users').doc(userId).update({ isAdmin: false });
  }
}
