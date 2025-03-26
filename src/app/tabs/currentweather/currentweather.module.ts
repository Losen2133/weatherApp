import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CurrentweatherPageRoutingModule } from './currentweather-routing.module';

import { CurrentweatherPage } from './currentweather.page';
import { PageHeaderComponent } from 'src/app/components/page-header/page-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CurrentweatherPageRoutingModule,
    PageHeaderComponent
  ],
  declarations: [CurrentweatherPage]
})
export class CurrentweatherPageModule {}
