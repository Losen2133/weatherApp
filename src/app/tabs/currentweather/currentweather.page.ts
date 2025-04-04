import { Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { NavigationStart, Router } from '@angular/router';
import { InitializationService } from 'src/app/services/initialization.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';

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
  weatherData: {
    currentWeather: { data: any; tempFormat: string } | null;
    hourlyWeather: { data: any; tempFormat: string } | null;
    dailyWeather: { data: any; tempFormat: string } | null;
  } = {
    currentWeather: null,
    hourlyWeather: null,
    dailyWeather: null,
  };
  currentWeatherIcon: any = null 
  currentWeatherParams: any = null;
  hourlyWeatherParams: any = null;
  previousPage: string | null = null;

  loading: boolean = true;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
    private  router: Router,
    private sharedService: SharedService
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

    this.sharedService.weatherData$.subscribe(data => {
      this.weatherData = data;
    })
    this.assignCurrentWeatherParams();
    this.assignHourlyWeatherParams();


    this.loading = false;
    console.log('Done loading!');
  }

  assignCurrentWeatherParams() {
    this.currentWeatherParams = {};
    this.currentWeatherParams.tempFormat = this.weatherData.currentWeather?.tempFormat
    this.currentWeatherParams.weather = this.weatherData.currentWeather?.data.weather[0];
    this.currentWeatherParams.wind = this.weatherData.currentWeather?.data.wind;
    this.currentWeatherParams.main = this.weatherData.currentWeather?.data.main;
    this.currentWeatherParams.icon = 'assets/icon/weather-icons/' + this.weatherData.currentWeather?.data.weather[0].icon + '.png';
  }

  assignHourlyWeatherParams() {
    this.hourlyWeatherParams = [];
    for(let counter = 0;counter < 5;counter++) {
      this.hourlyWeatherParams[counter] = {};
      this.hourlyWeatherParams[counter].tempFormat = this.weatherData.hourlyWeather?.tempFormat;
      this.hourlyWeatherParams[counter].dt = this.formatTimestamp(this.weatherData.hourlyWeather?.data.list[counter].dt * 1000);
      this.hourlyWeatherParams[counter].weather = this.weatherData.hourlyWeather?.data.list[counter].weather[0];
      this.hourlyWeatherParams[counter].wind = this.weatherData.hourlyWeather?.data.list[counter].wind;
      this.hourlyWeatherParams[counter].main = this.weatherData.hourlyWeather?.data.list[counter].main;
      this.hourlyWeatherParams[counter].icon = 'assets/icon/weather-icons/' + this.weatherData.hourlyWeather?.data.list[counter].weather[0].icon + '.png';
    }
  }

  formatTimestamp(timestamp: number) {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }


}
