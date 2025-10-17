import {Routes} from '@angular/router';
import {NotificationSender} from './components/notification-sender/notification-sender';

export const NotificationRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "sender",
        component: NotificationSender,
      }
    ]
  }
]
