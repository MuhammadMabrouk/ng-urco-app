import { Component } from '@angular/core';
import { NotificationsService } from 'src/app/shared/ui-elements/notifications/notifications.service';
import { Notifications } from 'src/app/shared/ui-elements/notifications/notifications';

// animations
import { fadeUp } from 'src/app/shared/animations/fade-effects/fade-up/fade-up';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  animations: [fadeUp]
})
export class NotificationsComponent {

  notifications: Notifications[] = this.notifySer.notifications;

  constructor(private notifySer: NotificationsService) {}

  // Function to Dismiss Notifications
  dismissNotify(index: number) {
    this.notifySer.dismissNotify(index);
  }
}
