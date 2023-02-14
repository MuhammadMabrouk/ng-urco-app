import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { GlobalJsFunctionsService } from 'src/app/shared/services/global-js-functions.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { IMyDate } from 'angular-mydatepicker';
import { UserProfile } from 'src/app/shared/interfaces/user/user-profile';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // here to store user info
  userInfo: UserProfile;

  // for profile picture
  fileRefs: Array<any> = [];
  filePuts: Array<any> = [];
  // exif orientation value for the uploaded profile picture
  profilePictureExifOrientation: number;

  constructor(
    private translateSer: TranslateService,
    private http: HttpClient,
    private fs: AngularFirestore,
    private storage: AngularFireStorage,
    private authSer: AuthService,
    private globalJs: GlobalJsFunctionsService,
    private notifySer: NotificationsService
  ) { }

  // prepare data for the registered user through the popup
  preparePopupUserData(data: firebase.auth.UserCredential) {

    // check if the user is exist or not
    this.fs.firestore.doc(`users/${data.user.uid}`).get()
      .then(doc => {
        if (!doc.exists) {

          const displayNameCapitalize: string = this.globalJs.toTitleCase(data.user.displayName);
          const fullName: string[] = displayNameCapitalize.split(' ');

          const userData: UserProfile = {
            id: data.user.uid,
            seqNo: Date.now(),
            registrationDate: (this.globalJs.getTimeInSpecificTimezone(undefined, true) as string),
            displayName: displayNameCapitalize,
            email: data.user.email,
            firstName: fullName[0],
            lastName: fullName[fullName.length - 1],
            userName: data.user.displayName.replace(/\s+/g, '_').toLowerCase(),
            isAdmin: false,
            providerId: data.additionalUserInfo.providerId
          };

          // prepare data for the registered user through the popup
          this.addNewUserFromPopupSignUp(userData)
            .then(() => {
              this.notifySer.setNotify({
                class: 'success',
                msg: this.translateSer.instant('toast-notifications.successfully-registered'),
                time: 5000
              });
            })
            .catch(() => {
              this.notifySer.setNotify({
                class: 'danger',
                msg: this.translateSer.instant('toast-notifications.oops-something-wrong'),
                time: 5000
              });
            });
        }
      });
  }

  // add info of popup new users to the database
  addNewUserFromPopupSignUp(userData: UserProfile) {
    // get the saved users count then save the new user
    return this.fs.firestore.collection('users').get().then(snap => {

      // store the new users count in database
      const usersCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new user data
          const addUserData = this.fs.doc(`users/${userData.id}`).set(userData);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ usersCount }).then(() => addUserData);
          } else {
            return generalInfoDoc.update({ usersCount }).then(() => addUserData);
          }
        });
    });
  }

  // add info of email new users to the database
  addNewUserFromEmailSignUp(userData: UserProfile) {
    // get the saved users count then save the new user
    return this.fs.firestore.collection('users').get().then(snap => {

      // store the new users count in database
      const usersCount = snap.size + 1;

      return this.fs.firestore.doc('dashboard/general-info').get()
        .then(infoDoc => {

          // 'general-info' doc path
          const generalInfoDoc = this.fs.collection('dashboard').doc('general-info');
          // save the new user data
          const addUserData = this.fs.doc(`users/${userData.id}`).set(userData);

          // check if the 'general-info' doc is exist or not
          if (!infoDoc.exists) {
            return generalInfoDoc.set({ usersCount }).then(() => addUserData);
          } else {
            return generalInfoDoc.update({ usersCount }).then(() => addUserData);
          }
        });
    });
  }

  // get user info
  getUserInfo(): Promise<UserProfile> {
    return this.fs.doc<UserProfile>(`users/${this.authSer.userId}`).valueChanges().pipe(first()).toPromise();
  }

  // get user info as observable
  getUserInfoAsObservable(): Observable<UserProfile> {
    return this.fs.doc<UserProfile>(`users/${this.authSer.userId}`).valueChanges();
  }

  // get user country data
  getUserCountryData() {
    return this.http.get('http://ip-api.com/json');
  }

  // upload profile picture
  uploadProfilePicture(files: FileList) {

    // reset array values
    this.fileRefs = [];
    this.filePuts = [];

    // create array for promises
    const filePromisesArray: Array<any> = [];

    Array.from(files).forEach(file => {
      filePromisesArray.push(new Promise((resolve) => {
        const ref = this.storage.ref(`users/${this.authSer.userId}/profile_picture`);
        const put = ref.put(file);
        this.fileRefs.push(ref);
        this.filePuts.push(put);
        resolve(put.percentageChanges());
      }));

      // get exif orientation value for the uploaded profile picture
      this.globalJs.getExifOrientation(file, (value) => {
        this.profilePictureExifOrientation = value;
      });
    });
    return Promise.all(filePromisesArray);
  }

  // get profile picture url
  getProfilePictureUrl() {
    const urlPromisesArray: Array<any> = []; // create array for promises

    this.filePuts.forEach((put, index) => {
      urlPromisesArray.push(new Promise((resolve) => {
        put.then(() => {
          resolve(this.fileRefs[index].getDownloadURL());
        });
      }));
    });
    return Promise.all(urlPromisesArray);
  }

  // update user data
  updateUserData(values: any, name: string) {
    if (name === 'basicInfoForm') {

      const displayName = `${this.globalJs.toTitleCase(values.firstName)} ${this.globalJs.toTitleCase(values.lastName)}`;
      const newObject: UserProfile = {
        firstName: values.firstName,
        lastName: values.lastName,
        displayName,
        userName: displayName.replace(/\s+/g, '_').toLowerCase(),
        country: values.country
      };

      // update user email only if a new email is entered
      if (this.userInfo.email !== values.email) {
        this.authSer.updateEmail(values.email)
          .then(() => {
            this.fs.doc(`users/${this.authSer.userId}`).update({email: values.email});
          })
          .catch((err) => {
            this.notifySer.setNotify({class: 'danger', msg: err, time: 5000});
          });
      }

      return this.fs.doc(`users/${this.authSer.userId}`).update(newObject);

    } else if (name === 'additionalInfoForm') {

      const dateRef = values.birthDate.singleDate.date;
      const birthDate: IMyDate = {
        day: dateRef.day,
        month: dateRef.month,
        year: dateRef.year
      };
      const newObject: UserProfile = {
        birthDate,
        gender: values.gender
      };

      return this.fs.doc(`users/${this.authSer.userId}`).update(newObject);

    } else if (name === 'securityForm') {

      return this.authSer.updatePassword(values.newPassword);

    } else if (name === 'profilePictureForm') {

      const profilePicture = {
        url: values.photoUrl,
        exifOrientation: this.profilePictureExifOrientation || null
      };

      return this.fs.doc(`users/${this.authSer.userId}`).update({ profilePicture });

    }
  }

  // delete uploaded profile picture if it is not saved
  deleteUploadedPicture(photoUrl: string) {
    return new Promise<void>(() => {
      this.storage.storage.refFromURL(photoUrl).delete();
    });
  }
}
