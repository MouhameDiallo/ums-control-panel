import { Routes } from '@angular/router';
import { PartenaireList } from './components/partenaire-list/partenaire-list';

export const PartenaireRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: PartenaireList
      }
    ]
  }
];
