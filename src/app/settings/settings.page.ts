import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '../services/preference.service';
import { ThemeService } from '../services/theme.service';
import { LocationService } from '../services/location.service';
import { WeatherService } from '../services/weather.service';
import { firstValueFrom } from 'rxjs';
import { SharedService } from '../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  settings: any = {};
  weatherData: {
    tempFormat: string | null;
    currentWeather: {
      tempFormat: any,
      weather: any,
      wind: any,
      main: any,
      icon: string
    } | null;
    hourlyWeather: {
      tempFormat: any,
      list: {
        dt: string,
        weather: any,
        wind: any,
        main: any,
        icon: string
      }[];
      
    } | null;
    dailyWeather: {
      tempFormat: any,
      list: {
        dt: string;
        temp: any;
        weather: any;
        main?: any;
        icon?: string;
      }[];
    } | null;
  } = {
    tempFormat: null,
    currentWeather: null,
    hourlyWeather: null,
    dailyWeather: null,
  };
  currentLocation: { lat: number, lon: number } | null = null;
  tempFormat: string = "metric";
  darkMode: boolean = false;

  constructor(
    private preferenceService: PreferenceService,
    private themeService: ThemeService,
    private router: Router,
    private locationService: LocationService,
    private weatherService: WeatherService,
    private sharedService: SharedService
  ) { }

  async ngOnInit() {
    await this.getUserSettings();
    this.themeService.toggleChange(this.darkMode);
  }

  async getUserSettings() {
    const userSettings = await this.preferenceService.getPreference('settings');
    this.tempFormat = userSettings.tempFormat;
    this.darkMode = userSettings.darkMode;
  }

  async settingChange() {
    if(this.settings.tempFormat != this.tempFormat) {
      this.currentLocation = await this.locationService.getCurrentPosition();
      await this.fetchWeather();
      this.sharedService.setWeatherData(this.weatherData);
      console.log('Fetched weather data')
    }
    this.settings.tempFormat = this.tempFormat;
    this.settings.darkMode = this.darkMode;
    this.themeService.toggleChange(this.darkMode);
    await this.preferenceService.createPreference('settings' ,this.settings);
    await this.preferenceService.createPreference('weatherData', this.weatherData);
  }

  async fetchWeather() {
    if(!this.currentLocation) {
      console.log('Cannot get weather data as of this moment!');
      alert('For settings to apply, you need to restart the app');
      return;
    }

    try {
      const [current, hourly, daily] = await Promise.all([
        firstValueFrom(this.weatherService.getCurrentWeather(this.currentLocation, this.tempFormat)),
        firstValueFrom(this.weatherService.getHourlyWeather(this.currentLocation, 5, this.tempFormat)),
        firstValueFrom(this.weatherService.getDailyWeather(this.currentLocation, 5, this.tempFormat))
      ]);

      this.weatherData = {
        tempFormat: this.tempFormat,
        currentWeather: current,
        hourlyWeather: hourly,
        dailyWeather: daily
      }      
    } catch(error) {
      console.error('Error fetching weather data as of this moment: ', error);
    }
  }

  goBack(){
    this.router.navigate(['/currentWeather']);
  }

}
