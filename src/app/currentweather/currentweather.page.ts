import { Component } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { NavigationStart, Router } from '@angular/router';
import { InitializationService } from 'src/app/services/initialization.service';
import { first, firstValueFrom, Subscription } from 'rxjs';
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
  search: string = 'mandaue';

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

  private async loadData() {
    this.userSettings = await this.preferenceService.getPreference('settings');

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


    this.loading = false;
    console.log('Done loading!');

    // this.searchWeather();
    // console.log('Done Search');
  }

  assignCurrentWeatherParams() {
    console.log(this.weatherData.currentWeather);
    this.currentWeatherParams = {};
    this.currentWeatherParams.tempFormat = this.weatherData.tempFormat
    this.currentWeatherParams.weather = this.weatherData.currentWeather?.data.weather[0];
    this.currentWeatherParams.wind = this.weatherData.currentWeather?.data.wind;
    this.currentWeatherParams.main = this.weatherData.currentWeather?.data.main;
    this.currentWeatherParams.icon = 'assets/icon/weather-icons/' + this.weatherData.currentWeather?.data.weather[0].icon + '.png';
  }

  assignHourlyWeatherParams() {
    console.log(this.weatherData.hourlyWeather);
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
    console.log(this.weatherData.dailyWeather);
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

  async searchWeather() {
    if(this.search === '') {
      this.weatherData = await this.preferenceService.getPreference('weatherData');
    } else {
      
      this.loading = true;
      this.weatherData.tempFormat = this.userSettings.tempFormat;
      await this.getCurrentWeatherByCityName(this.search);
      await this.getHourlyWeatherByCityName(this.search);
      await this.getDailyWeatherByCityName(this.search);
      this.assignCurrentWeatherParams();
      this.assignHourlyWeatherParams();
      this.assignDailyWeatherParams();
    }
  }

  async getCurrentWeatherByCityName(city: string) {
    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getCurrentWeatherByCityName(city, this.userSettings.tempFormat)
      );

      this.weatherData.currentWeather = this.weatherData.currentWeather ?? { data: null};
      this.weatherData.currentWeather = weatherData
    } catch(error) {
      console.error('Error fetching current weather data as of the moment: ', error);
      this.weatherData.currentWeather = null;
    }
  }

  async getHourlyWeatherByCityName(city: string) {
    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getHourlyWeatherByCityName(city, 5, this.userSettings.tempFormat)
      );

      this.weatherData.hourlyWeather = this.weatherData.hourlyWeather ?? { data: null};
      this.weatherData.hourlyWeather = weatherData
    } catch(error) {
      console.error('Error fetching hourly weather data as of this moment: ', error);
      this.weatherData.hourlyWeather = null;
    }
  }

  async getDailyWeatherByCityName(city: string) {
    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getDailyWeatherByCityName(city, 5, this.userSettings.tempFormat)
      );

      this.weatherData.dailyWeather = this.weatherData.dailyWeather ?? { data: null};
      this.weatherData.dailyWeather = weatherData
    } catch(error) {
      console.error('Error fetching hourly weather data as of this moment: ', error);
      this.weatherData.dailyWeather = null;
    }
  }
}
