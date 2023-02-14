import { Injectable } from '@angular/core';
import { Notifications } from 'src/app/shared/ui-elements/notifications/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  notifications: Notifications[] = []; // store notifications here

  // Notifications to Show Messages
  setNotify(notification: Notifications): void {
    if (notification.id) {
      if (!this.notifications.some(e => e.id === notification.id)) {
        this.notifications.push(notification);
      }
    } else {
      this.notifications.push(notification);
    }

    // Remove the notification from the notifications array after 2 seconds
    if (notification.time) {
      setTimeout(() => {
        this.notifications.shift();
      }, notification.time);
    }
  }

  // Dismiss Notifications
  dismissNotify(indexOrId: number|string) {

    if (typeof indexOrId === 'number') {

      this.notifications.splice(indexOrId, 1);

    } else if (typeof indexOrId === 'string') {

      const selectedNotif = this.notifications.filter(notif => {
        return notif.id === indexOrId;
      });

      for (let i = 0; i < this.notifications.length; i++) {

        if (selectedNotif[0]) {
          if (this.notifications[i].id === selectedNotif[0].id) {
            this.notifications.splice(i, 1);
          }
        }
      }
    }
  }

}
