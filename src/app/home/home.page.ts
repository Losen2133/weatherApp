import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';
import { PreferenceService } from '../services/preference.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  location: any = {};
  currentDate: number = new Date().setHours(0,0,0,0);
  userSettings: any;

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService,
    private preferenceService: PreferenceService,
  ) {
    
  }

  async ngOnInit() {
    await this.getUserSettings();
    this.location = await this.locationService.getCurrentLocation();
    this.getCurrentWeatherReport(this.location.latitude, this.location.longitude, this.userSettings.tempFormat);
  }

  async getUserSettings() {
    this.userSettings = await this.preferenceService.getPreference('settings');
    if(this.userSettings === null) {
      this.preferenceService.createSettingPreference({'tempFormat': 'metric'});
    }
  }

  getCurrentWeatherReport(lat: number, lon: number, units: string = '') {
    this.weatherService.getCurrentWeather(lat, lon, units).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        alert("Unable to get current weather report as of this moment: "+error);
      }
    )
  }
}
