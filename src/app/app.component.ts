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
    currentWeather: {} | null;
    hourlyWeather: {} | null;
    dailyWeather: {} | null;
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

    //await this.preferenceService.clearPreferences();
    await this.setUserSettings();
  
    this.location = await this.locationService.getCurrentPosition();
    
    await this.fetchWeather();

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

  async setUserSettings() {
    this.userSettings = await this.preferenceService.getPreference('settings'); // User Settings
    if(this.userSettings === null) {
      console.log('Settings not set, initializing settings...');
      this.initUserSettings();
      this.userSettings = await this.preferenceService.getPreference('settings');
      console.log('Settings Initialized', this.userSettings);
    }
    this.sharedService.setUserSettings(this.userSettings);
  }

  async fetchWeather() {
    if(this.isConnected) {
      this.weatherData.tempFormat = this.userSettings.tempFormat;

      await this.getWeatherData();
      console.log(this.weatherData);
      
      this.sharedService.setWeatherData(this.weatherData);
      await this.preferenceService.createPreference('weatherData', this.weatherData);
    } else {
      this.weatherData = await this.preferenceService.getPreference('weatherData');
      this.sharedService.setWeatherData(this.weatherData);
    }
  }

  async getWeatherData() {
    if(!this.location) {
      console.log('Cannot get weather data as of this moment!');
      return;
    }

    try {
      const [current, hourly, daily] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeather(this.location, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getHourlyWeather(this.location, 5, this.userSettings.tempFormat)),
        firstValueFrom(this.weatherService.getDailyWeather(this.location, 5, this.userSettings.tempFormat))
      ]);

      this.weatherData = {
        tempFormat: this.userSettings.tempFormat,
        currentWeather: current,
        hourlyWeather: hourly,
        dailyWeather: daily
      }
    } catch(error) {
      console.error('Error fetching weather data as of the moment: ', error);
      this.weatherData.currentWeather = null;
    }
  }
}
