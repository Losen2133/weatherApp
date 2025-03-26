import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationPage } from './navigation.page';

const routes: Routes = [
  {
    path: '',
    component: NavigationPage,
    children: [
      {
        path: 'currentweather',
        children: [
          {
            path: '',
            loadChildren: () => import('../tabs/currentweather/currentweather.module').then(m => m.CurrentweatherPageModule)
          }
        ]
      },
      {
        path: 'weatherforecast',
        children: [
          {
            path: '',
            loadChildren: () => import('../tabs/weatherforecast/weatherforecast.module').then(m => m.WeatherforecastPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/navigation/currentweather',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/navigation/currentweather',
    pathMatch: 'full'
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NavigationPageRoutingModule {}
