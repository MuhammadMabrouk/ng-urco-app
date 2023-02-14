import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase';
import { MainLoadingService } from 'src/app/shared/ui-elements/main-loading/main-loading.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user: Observable<firebase.User>;
  isLoggedIn: boolean;
  userId: string;

  constructor(
    private afAuth: AngularFireAuth,
    private mainLoadingSer: MainLoadingService
  ) {
    this.user = afAuth.user;
  }

  // SignUp & signIn with popup
  signInWithPopup(providerName: string) {

    // SignUp with google
    if (providerName === 'googleSignIn') {

      return this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());

      // SignUp with facebook
    } else if (providerName === 'fbSignIn') {

      return this.afAuth.auth.signInWithPopup(new auth.FacebookAuthProvider());

      // SignUp with twitter
    } else if (providerName === 'twSignIn') {

      return this.afAuth.auth.signInWithPopup(new auth.TwitterAuthProvider());
    }
  }

  // SignUp with email & password
  emailSignUp(email: string, password: string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  // Send email verification when new user sign up
  SendVerificationMail() {
    return this.afAuth.auth.currentUser.sendEmailVerification();
  }

  // SignIn with email & password
  emailSignIn(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  // Reset Password
  resetPassword(email: string) {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  // update user email
  updateEmail(newEmail: string) {
    return this.afAuth.auth.currentUser.updateEmail(newEmail);
  }

  // update user password
  updatePassword(newPassword: string) {
    return this.afAuth.auth.currentUser.updatePassword(newPassword);
  }

  // logOut
  logOut() {
    this.mainLoadingSer.startLoading();

    this.afAuth.auth.signOut()
      .then(() => this.mainLoadingSer.endLoading())
      .catch(() => this.mainLoadingSer.endLoading());
  }
}
