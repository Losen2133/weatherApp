import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { WeatherService } from './services/weather.service';
import { PreferenceService } from './services/preference.service';
import { ThemeService } from './services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  userSettings: any;
  location: { lat: number, lon: number } | null = null;
  currentWeather: any = {};

  constructor(
    private locationService: LocationService,
    private weatherService: WeatherService,
    private preferenceService: PreferenceService,
    private themeService: ThemeService
  ) {}

  async ngOnInit() {
    //await this.preferenceService.clearPreferences();
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

    this.currentWeather = await this.preferenceService.getPreference('currentWeather'); // Current Weather
    if(this.currentWeather === null) {
      console.log('Current Weather data not collected, collecting data...');
      this.getCurrentWeather();
      this.currentWeather = await this.preferenceService.getPreference('currentWeather');
    }
  }

  async initUserSettings() {
    const setting = {
      darkMode: false,
      tempFormat: 'metric'
    }

    await this.preferenceService.createPreference('settings', setting);
  }


  getCurrentWeather() {
    if(!this.location) {
      console.log('Cannot get weather data as of this moment!');
      return;
    }
    
    this.weatherService.getCurrentWeather(this.location, this.userSettings.tempFormat).subscribe(
      async (data) => {
        console.log('Weather Fetch: ', this.currentWeather);
        await this.preferenceService.createPreference('currentWeather', data);
      },
      (error) => {
        console.error('Error fetching weather data: ', error);
      }
    )
  }

}
