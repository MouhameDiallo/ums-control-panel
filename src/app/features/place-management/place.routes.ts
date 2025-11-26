import {Routes} from '@angular/router';
import {PlaceList} from './components/place-list/place-list';

export const PlaceRoutes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: PlaceList,
      }
    ]
  }
]
