import {Routes} from '@angular/router';
import {UserList} from './components/user-list/user-list';

export const UserRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: UserList,
      }
    ]
  }
]
