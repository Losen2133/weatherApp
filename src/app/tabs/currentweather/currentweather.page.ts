import { Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.page.html',
  styleUrls: ['./currentweather.page.scss'],
  standalone: false
})
export class CurrentweatherPage {
  userSettings: any;
  location: { lat: number; lon: number } | null = null;
  currentWeather: any = null;
  currentWeatherParams: any = null;
  hourlyWeather: any = null;
  hourlyWeatherParams: any = null;
  previousPage: string | null = null;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private  router: Router
  ) {
    router.events.subscribe((event) => {
      if(event instanceof NavigationStart) {
        this.previousPage = router.url;

        if(this.previousPage === '/settings') {
          console.log('Navigated from: ', this.previousPage);
        }
      }
    })
  }

  async ngOnInit() {
    this.locationService.startWatchingPosition();
    this.locationService.location$.subscribe(coords => {
      if(coords) {
        this.location = coords;
      }
    });
    this.location = await this.locationService.getCurrentPosition();

    this.currentWeather = await this.preferenceService.getPreference('currentWeather');
    this.hourlyWeather = await this.preferenceService.getPreference('hourlyWeather');
    
  }

  async checkForSettingsChange() {
    this.userSettings = await this.preferenceService.getPreference('settings');
  }

  assignCurrentWeatherParams() {
    this.currentWeatherParams = {};
    this.currentWeatherParams.tempFormat = this.currentWeather.tempFormat;
    this.currentWeatherParams.weather = this.currentWeather.data.weather[0];
    this.currentWeatherParams.wind = this.currentWeather.data.wind;
    this.currentWeatherParams.main = this.currentWeather.data.main;


  }

  asignHourlyWeatherParams() {

  }


}
