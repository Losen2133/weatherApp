import { Component } from '@angular/core';
import { PreferenceService } from '../services/preference.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  location: any = {};
  currentDate: number = new Date().setHours(0,0,0,0);
  userSettings: any;

  constructor(
    private preferenceService: PreferenceService,
    private themeService: ThemeService
  ) {
    
  }

  async ngOnInit() {
    this.userSettings = await this.getUserSettings();
    this.themeService.toggleChange(this.userSettings.darkMode);
  }

  async getUserSettings() {
    let settings = await this.preferenceService.getPreference('settings');
    if (!settings) {
      settings = { tempFormat: 'metric', darkMode: 'false' };
      await this.preferenceService.createSettingPreference(settings);
    }
    return settings;
  }
}
