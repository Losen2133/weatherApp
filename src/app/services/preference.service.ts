import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {

  constructor() { }

  async getPreference(key: string): Promise<any> {
    const preference = (await Preferences.get({ key: key }))?.value;
    if(preference) {
      try{
        return JSON.parse(preference);
      }catch(error) {
        return preference;
      }
    }
    return null;
  }

  async createSettingPreference(settings: any) {
    try {
      await Preferences.set({ key: 'settings', value: JSON.stringify(settings) });
    } catch(error){
      console.log("Cannot create user setting preference as of this moment: "+error);
    }
  }

  async clearPreferences() {
    await Preferences.clear();
    alert("Preferences Cleared!");
  }
}
