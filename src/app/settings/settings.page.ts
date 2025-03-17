import { Component, OnInit } from '@angular/core';
import { PreferenceService } from '../services/preference.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  settings: any = {};
  tempFormat: string = "metric";

  constructor(private preferenceService: PreferenceService) { }

  async ngOnInit() {
    await this.getUserSettings();
  }

  async getUserSettings() {
    const userSettings = await this.preferenceService.getPreference('settings');
    this.tempFormat = userSettings.tempFormat;
  }

  async settingChange() {
    this.settings.tempFormat = this.tempFormat;
    await this.preferenceService.createSettingPreference(this.settings);
  }

}
