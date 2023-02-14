import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardService implements CanActivate {

  // used as flag and url to specify where to go
  redirectUrl: string;

  constructor(
    private translateSer: TranslateService,
    private router: Router,
    private authSer: AuthService,
    private userSer: UserService,
    private notifySer: NotificationsService
  ) { }

  // allow moving to the route if the user is admin
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise(resolve => {
      this.authSer.user.subscribe(user => {
        // check if the user is signed in or not
        if (!user) {

          // don't do if it's normal logout
          if (!this.redirectUrl) {

            // show an alert to the user
            this.notifySer.setNotify({
              id: 'admin-guard',
              class: 'danger',
              msg: this.translateSer.instant('toast-notifications.not-allowed-here'),
              time: 5000
            });

            // not signed in so redirect to the 'homepage'
            this.router.navigate(['/']);

          } else {

            // normal logout so redirect to the 'homepage'
            this.router.navigate([this.redirectUrl]);
          }

          resolve(false);
        } else {

          // check if the user is admin or not
          this.userSer.getUserInfoAsObservable().subscribe(res => {
            if (!res.isAdmin) {

              // don't do if it's normal logout
              if (!this.redirectUrl) {

                // show an alert to the user
                this.notifySer.setNotify({
                  id: 'admin-guard',
                  class: 'danger',
                  msg: this.translateSer.instant('toast-notifications.not-allowed-here'),
                  time: 5000
                });

                // not an admin so redirect to the 'homepage'
                this.router.navigate(['/']);

              } else {

                // normal logout so redirect to the 'homepage'
                this.router.navigate([this.redirectUrl]).then(() => this.redirectUrl = null);
              }

            } else {

              resolve(true);
            }
          });
        }
      });
    });
  }
}
