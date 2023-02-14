import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserGuardService } from 'src/app/shared/services/routes-guards/user-guard.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-user-dashboard-sidebar',
  templateUrl: './user-dashboard-sidebar.component.html',
  styleUrls: ['./user-dashboard-sidebar.component.scss'],
  animations: [fadeInUp]
})
export class UserDashboardSidebarComponent implements OnInit, OnDestroy {

  displayName: string;
  isAdmin: boolean;
  profilePicture: string;
  exifOrientation: number;

  // flag for slide toggle button
  isOpen: boolean = false;

  // store subscriptions for unsubscribe when component destroyed
  subscriptions: Subscription[] = [];

  constructor(
    private authSer: AuthService,
    private userGuardSer: UserGuardService,
    private userSer: UserService
  ) { }

  ngOnInit() {
    // get user info
    this.subscriptions.push(this.authSer.user.subscribe(user => {
      if (user) {
        this.userSer.getUserInfo().then(data => {
          this.displayName = data.displayName;
          this.isAdmin = data.isAdmin;

          // if the user have profile picture
          if (data.profilePicture) {
            this.profilePicture = data.profilePicture.url;
            this.exifOrientation = data.profilePicture.exifOrientation;
          }
        });
      }
    }));
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // toggle sidebar links
  toggleSidebarLinks(sidebarLinks: HTMLElement) {
    this.isOpen = !this.isOpen;

    $(sidebarLinks).slideToggle(400);
  }

  // logOut
  logOut() {
    // tell the guard to go to the homepage after logout
    this.userGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }
}
