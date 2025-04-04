import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CurrentweatherPage } from './currentweather.page';

const routes: Routes = [
  {
    path: '',
    component: CurrentweatherPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CurrentweatherPageRoutingModule {}
