import {Routes} from '@angular/router';
import {NotificationSender} from './components/notification-sender/notification-sender';
import {NotificationList} from './components/notification-list/notification-list';

export const NotificationRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "sender",
        component: NotificationSender,
      },
      {
        path: "",
        component: NotificationList,
      }
    ]
  }
]
