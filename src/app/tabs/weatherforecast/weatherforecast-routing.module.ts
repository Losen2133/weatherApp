import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeatherforecastPage } from './weatherforecast.page';

const routes: Routes = [
  {
    path: '',
    component: WeatherforecastPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeatherforecastPageRoutingModule {}
