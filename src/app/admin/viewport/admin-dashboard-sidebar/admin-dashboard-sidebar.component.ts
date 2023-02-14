import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/shared/services/user/auth.service';
import { UserService } from 'src/app/shared/services/user/user.service';
import { AdminGuardService } from 'src/app/shared/services/routes-guards/admin-guard.service';
import { Subscription } from 'rxjs';

// animations
import { fadeInUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-in-up';

@Component({
  selector: 'app-admin-dashboard-sidebar',
  templateUrl: './admin-dashboard-sidebar.component.html',
  styleUrls: ['./admin-dashboard-sidebar.component.scss'],
  animations: [fadeInUp]
})
export class AdminDashboardSidebarComponent implements OnInit, OnDestroy {

  displayName: string;
  profilePicture: string;
  exifOrientation: number;

  // flag for slide toggle button
  isOpen: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private authSer: AuthService,
    private userSer: UserService,
    private adminGuardSer: AdminGuardService
  ) { }

  ngOnInit() {
    // get user info
    this.subscriptions.push(this.authSer.user.subscribe(user => {
      if (user) {
        this.userSer.getUserInfo().then(data => {
          this.displayName = data.displayName;

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
    this.adminGuardSer.redirectUrl = '/';

    // sign out
    this.authSer.logOut();
  }

  // show and hide sub menus in the side bar
  showSubMenu(el, menu) {
    $(menu).slideToggle();
    $(el.target).toggleClass('open');
  }
}
