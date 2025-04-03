import { Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { NavigationStart, Router } from '@angular/router';
import { InitializationService } from 'src/app/services/initialization.service';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.page.html',
  styleUrls: ['./currentweather.page.scss'],
  standalone: false
})
export class CurrentweatherPage {
  private initStatusSubscription: Subscription | undefined;
  userSettings: any;
  location: { lat: number; lon: number } | null = null;
  currentWeather: any = null;
  currentWeatherIcon: any = null 
  currentWeatherParams: any = null;
  hourlyWeather: any = null;
  hourlyWeatherIcon: any = null;
  hourlyWeatherParams: any = null;
  previousPage: string | null = null;

  loading: boolean = true;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
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
    this.initStatusSubscription = this.initService.getInitStatus().subscribe(isInitialized => {
      if(isInitialized) {
        this.loadData()
      }
    });
  }

  async checkForSettingsChange() {
    this.userSettings = await this.preferenceService.getPreference('settings');
  }

  private async loadData() {
    this.locationService.startWatchingPosition();
    this.locationService.location$.subscribe(coords => {
      if(coords) {
        this.location = coords;
      }
    });
    this.location = await this.locationService.getCurrentPosition();

    this.currentWeather = await this.preferenceService.getPreference('currentWeather');
    this.hourlyWeather = await this.preferenceService.getPreference('hourlyWeather');
    this.assignCurrentWeatherParams();
    console.log(this.currentWeatherParams.icon);
    this.currentWeatherIcon = this.currentWeatherParams.icon;

    this.loading = false;
    console.log('Done loading!');
  }

  assignCurrentWeatherParams() {
    this.currentWeatherParams = {};
    this.currentWeatherParams.tempFormat = this.currentWeather.tempFormat;
    this.currentWeatherParams.weather = this.currentWeather.data.weather[0];
    this.currentWeatherParams.wind = this.currentWeather.data.wind;
    this.currentWeatherParams.main = this.currentWeather.data.main;
    this.currentWeatherParams.icon = 'assets/icon/weather-icons/' + this.currentWeather.data.weather[0].icon + '@2x.png'
  }

  asignHourlyWeatherParams() {

  }


}
