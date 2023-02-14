import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CanActivate, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuardService implements CanActivate {

  constructor(
    private translateSer: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private authSer: AuthService,
    private notifySer: NotificationsService
  ) { }

  // allow moving to the route if the user isn't signed in (guest)
  canActivate(): Promise<boolean> {
    return new Promise(resolve => {
      this.authSer.user.subscribe(user => {
        // check if the user is signed in or a guest
        if (user) {

          // get return url from route parameters and store it to return to after login
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          // don't do if it's normal sign in
          if (!returnUrl) {
            // show an alert that tells the user to sign in before moving to this page
            this.notifySer.setNotify({
              id: 'guest-guard',
              class: 'danger',
              msg: this.translateSer.instant('toast-notifications.not-allowed-here'),
              time: 5000
            });

            // already signed in so redirect to the 'homepage'
            this.router.navigate(['']);
          } else if (returnUrl === 'condone') {
            // do nothing
          } else {

            // normal sign in so redirect to the 'returnUrl'
            this.router.navigateByUrl(returnUrl);
          }

          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
