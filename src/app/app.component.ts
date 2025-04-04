import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { WeatherService } from './services/weather.service';
import { PreferenceService } from './services/preference.service';
import { Network } from '@capacitor/network';
import { firstValueFrom } from 'rxjs';
import { InitializationService } from './services/initialization.service';
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  isConnected = false;
  userSettings: any;
  location: { lat: number, lon: number } | null = null;
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

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService,
    private sharedService: SharedService
  ) {}

  async ngOnInit() {
    await this.checkNetworkStatus();

    Network.addListener('networkStatusChange', status => {
      this.isConnected = status.connected;
    })

    await this.preferenceService.clearPreferences();
    this.userSettings = await this.preferenceService.getPreference('settings'); // User Settings
    if(this.userSettings === null) {
      console.log('Settings not set, initializing settings...');
      this.initUserSettings();
      this.userSettings = await this.preferenceService.getPreference('settings');
      console.log('Settings Initialized', this.userSettings);
    }
    this.sharedService.setUserSettings(this.userSettings);

    this.locationService.startWatchingPosition(); // Location Service
    this.locationService.location$.subscribe(coords => {
      if(coords) {
        this.location = coords;
      }
    });
    this.location = await this.locationService.getCurrentPosition();
    console.log('Current Location: ', this.location);

    if(this.isConnected) {
      this.weatherData.tempFormat = this.userSettings.tempFormat;

      await this.getCurrentWeather();
      await this.getHourlyWeather();
      await this.getDailyWeather();
      console.log(this.weatherData);
      
      this.sharedService.setWeatherData(this.weatherData);
      await this.preferenceService.createPreference('weatherData', this.weatherData);
    } else {
      this.weatherData = await this.preferenceService.getPreference('weatherData');
      this.sharedService.setWeatherData(this.weatherData);
    }

    this.initService.initComplete();
    console.log('Initialization Complete!!');
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isConnected = status.connected;
  }

  async initUserSettings() {
    const setting = {
      darkMode: false,
      tempFormat: 'metric'
    }

    await this.preferenceService.createPreference('settings', setting);
  }


  async getCurrentWeather() {
    if(!this.location) {
      console.log('Cannot get weather data as of this moment!');
      return;
    }

    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getCurrentWeather(this.location, this.userSettings.tempFormat)
      );


      this.weatherData.currentWeather = this.weatherData.currentWeather ?? { data: null };
      this.weatherData.currentWeather.data = weatherData;
    } catch(error) {
      console.error('Error fetching current weather data as of the moment: ', error);
      this.weatherData.currentWeather = null;
    }
  }

  async getHourlyWeather() {
    if(!this.location) {
      console.log('Cannot get weather data as of this moment!');
      return;
    }

    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getHourlyWeather(this.location, 5, this.userSettings.tempFormat)
      );

      this.weatherData.hourlyWeather = this.weatherData.hourlyWeather ?? { data: null };
      this.weatherData.hourlyWeather.data = weatherData;
    } catch(error) {
      console.error('Error fetching hourly weather data as of this moment: ', error);
      this.weatherData.hourlyWeather = null;
    }
  }

  async getDailyWeather() {
    if(!this.location) {
      console.log('Cannot get weather data as of this moment!');
      return;
    }

    try {
      const weatherData = await firstValueFrom(
        this.weatherService.getDailyWeather(this.location, 5, this.userSettings.tempFormat)
      );

      this.weatherData.dailyWeather = this.weatherData.dailyWeather ?? { data: null };
      this.weatherData.dailyWeather.data = weatherData;  
    } catch(error) {
      console.error('Error fetching daily weather data as of this moment: ', error);
      this.weatherData.dailyWeather = null;
    }
  }

}
