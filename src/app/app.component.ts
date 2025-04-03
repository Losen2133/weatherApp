import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { WeatherService } from './services/weather.service';
import { PreferenceService } from './services/preference.service';
import { Network } from '@capacitor/network';
import { firstValueFrom } from 'rxjs';
import { InitializationService } from './services/initialization.service';

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
  currentWeather: any = null;
  hourlyWeather: any = null;
  dailyWeather: any = null;

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private initService: InitializationService
  ) {}

  async ngOnInit() {
    await this.checkNetworkStatus();

    Network.addListener('networkStatusChange', status => {
      this.isConnected = status.connected;
    })

    if(this.currentWeather === null) {
      console.log('null here');
    }

    await this.preferenceService.clearPreferences();
    this.userSettings = await this.preferenceService.getPreference('settings'); // User Settings
    if(this.userSettings === null) {
      console.log('Settings not set, initializing settings...');
      this.initUserSettings();
      this.userSettings = await this.preferenceService.getPreference('settings');
      console.log('Settings Initialized', this.userSettings);
    }

    this.locationService.startWatchingPosition(); // Location Service
    this.locationService.location$.subscribe(coords => {
      if(coords) {
        this.location = coords;
      }
    });
    this.location = await this.locationService.getCurrentPosition();
    console.log('Current Location: ', this.location);

    if(this.isConnected) {
      await this.getCurrentWeather();
      console.log('Current Weather: ', this.currentWeather);
      await this.preferenceService.createPreference('currentWeather', this.currentWeather);

      await this.getHourlyWeather();
      console.log('Hourly Weather: ', this.hourlyWeather);
      await this.preferenceService.createPreference('hourlyWeather', this.hourlyWeather);

      await this.getDailyWeather();
      console.log('Daily Weather: ', this.dailyWeather);
      await this.preferenceService.createPreference('dailyWeather', this.dailyWeather);
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

      this.currentWeather = this.currentWeather ?? {};
      this.currentWeather.data = weatherData;
      this.currentWeather.tempFormat = this.userSettings.tempFormat;
    } catch(error) {
      console.error('Error fetching current weather data as of the moment: ', error);
      this.currentWeather = null;
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

      this.hourlyWeather = this.hourlyWeather ?? {};
      this.hourlyWeather.data = weatherData;
      this.hourlyWeather.tempFormat = this.userSettings.tempFormat;
    } catch(error) {
      console.error('Error fetching hourly weather data as of this moment: ', error);
      this.hourlyWeather = null;
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

      this.dailyWeather = this.dailyWeather ?? {};
      this.dailyWeather.data = weatherData;
      this.dailyWeather.tempFormat = this.userSettings.tempFormat;      
    } catch(error) {
      console.error('Error fetching daily weather data as of this moment: ', error);
      this.dailyWeather = null;
    }
  }

}
