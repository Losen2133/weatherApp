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
    tempFormat: string | null;
    currentWeather: { data: any; } | null;
    hourlyWeather: { data: any; } | null;
    dailyWeather: { data: any; } | null;
  } = {
    tempFormat: null,
    currentWeather: null,
    hourlyWeather: null,
    dailyWeather: null,
  };
  currentWeatherParams: any = null;
  hourlyWeatherParams: any = null;
  dailyWeatherParams: any = null;

  loading: boolean = true;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
    private sharedService: SharedService
  ) {
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
    this.assignDailyWeatherParams();
    console.log(this.dailyWeatherParams);


    this.loading = false;
    console.log('Done loading!');
  }

  assignCurrentWeatherParams() {
    this.currentWeatherParams = {};
    this.currentWeatherParams.tempFormat = this.weatherData.tempFormat
    this.currentWeatherParams.weather = this.weatherData.currentWeather?.data.weather[0];
    this.currentWeatherParams.wind = this.weatherData.currentWeather?.data.wind;
    this.currentWeatherParams.main = this.weatherData.currentWeather?.data.main;
    this.currentWeatherParams.icon = 'assets/icon/weather-icons/' + this.weatherData.currentWeather?.data.weather[0].icon + '.png';
  }

  assignHourlyWeatherParams() {
    this.hourlyWeatherParams = [];
    for(let counter = 0;counter < 5;counter++) {
      this.hourlyWeatherParams[counter] = {};
      this.hourlyWeatherParams[counter].tempFormat = this.weatherData.tempFormat;
      this.hourlyWeatherParams[counter].dt = this.formatTimestampToTime(this.weatherData.hourlyWeather?.data.list[counter].dt * 1000);
      this.hourlyWeatherParams[counter].weather = this.weatherData.hourlyWeather?.data.list[counter].weather[0];
      this.hourlyWeatherParams[counter].wind = this.weatherData.hourlyWeather?.data.list[counter].wind;
      this.hourlyWeatherParams[counter].main = this.weatherData.hourlyWeather?.data.list[counter].main;
      this.hourlyWeatherParams[counter].icon = 'assets/icon/weather-icons/' + this.weatherData.hourlyWeather?.data.list[counter].weather[0].icon + '.png';
    }
  }

  assignDailyWeatherParams() {
    this.dailyWeatherParams = [];
    for(let counter = 0;counter < 5;counter++) {
      this.dailyWeatherParams[counter] = {};
      this.dailyWeatherParams[counter].tempFormat = this.weatherData.tempFormat;
      this.dailyWeatherParams[counter].dt = this.formatTimestampToString(this.weatherData.dailyWeather?.data.list[counter].dt * 1000);
      this.dailyWeatherParams[counter].weather = this.weatherData.dailyWeather?.data.list[counter].weather[0];
      this.dailyWeatherParams[counter].temp = this.weatherData.dailyWeather?.data.list[counter].temp;
      this.dailyWeatherParams[counter].main = this.weatherData.dailyWeather?.data.list[counter].main;
      this.dailyWeatherParams[counter].icon = 'assets/icon/weather-icons/' + this.weatherData.dailyWeather?.data.list[counter].weather[0].icon + '.png';
    }
  }

  formatTimestampToTime(timestamp: number) {
    return new Date(timestamp).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatTimestampToString(timestamp: number): string {
    const date = new Date(timestamp);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[date.getDay()];
    return `${dayName}, ${formattedDate}`;
  }


}
