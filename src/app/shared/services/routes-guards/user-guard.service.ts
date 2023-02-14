import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuardService implements CanActivate {

  // used as flag and url to specify where to go
  redirectUrl: string;

  constructor(
    private translateSer: TranslateService,
    private router: Router,
    private authSer: AuthService,
    private notifySer: NotificationsService
  ) { }

  // allow moving to the route if the user is signed in
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      this.authSer.user.subscribe(user => {
        // check if the user is signed in or not
        if (!user) {

          // don't do if it's normal logout
          if (!this.redirectUrl) {

            // show an alert that tells the user to sign in before moving to this page
            this.notifySer.setNotify({
              id: 'user-guard',
              class: 'danger',
              msg: this.translateSer.instant('toast-notifications.sign-in-to-go-to-this-page'),
              time: 5000
            });

            // not signed in so redirect to the 'sign-in' page with the 'returnUrl'
            this.router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url }});
          } else {

            // normal logout so redirect to the 'homepage'
            this.router.navigate([this.redirectUrl]).then(() => this.redirectUrl = null);
          }

          resolve(false);
        } else {

          resolve(true);
        }
      });
    });
  }
}
