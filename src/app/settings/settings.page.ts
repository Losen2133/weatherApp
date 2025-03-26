import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '../services/preference.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  settings: any = {};
  tempFormat: string = "metric";
  darkMode: boolean = false;

  constructor(
    private preferenceService: PreferenceService,
    private themeService: ThemeService
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
    this.settings.tempFormat = this.tempFormat;
    this.settings.darkMode = this.darkMode;
    this.themeService.toggleChange(this.darkMode);
    await this.preferenceService.createSettingPreference(this.settings);
  }

}
