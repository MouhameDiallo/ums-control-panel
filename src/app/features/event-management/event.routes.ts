import {Routes} from '@angular/router';
import {EventList} from './components/event-list/event-list';

export const EventRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: EventList,
      }
    ]
  }
]
