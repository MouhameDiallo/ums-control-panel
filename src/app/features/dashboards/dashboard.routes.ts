import {Routes} from '@angular/router';
import {GeneralDashboard} from './components/general-dashboard/general-dashboard';

export const DashboardRoutes : Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: GeneralDashboard,
      }
    ]
  }
]
