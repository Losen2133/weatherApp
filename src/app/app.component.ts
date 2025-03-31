import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { WeatherService } from './services/weather.service';
import { PreferenceService } from './services/preference.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  userSettings: any;
  location: { lat: number, lon: Number } | null = null;
  currentWeather: any;

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

    this.startLocation();
    

    this.currentWeather = await this.preferenceService.getPreference('currentWeather'); // Current Weather
    if(this.currentWeather === null) {
      console.log('Current Weather data not collected, collecting data...');

    }
  }

  async initUserSettings() {
    const setting = {
      darkMode: false,
      tempFormat: 'metric'
    }

    await this.preferenceService.createPreference('settings', setting);
  }

  startLocation() {
    this.locationService.location$.subscribe((coords: { lat: number; lon: Number; } | null) => {
      if(coords) {
        this.location = coords;
        console.log(this.location);
      }
    })
  }

  async getCurrentWeather() {
    
  }

}
