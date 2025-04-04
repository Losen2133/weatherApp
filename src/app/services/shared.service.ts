import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private weatherDataSource = new BehaviorSubject<any>(null);
  weatherData$ = this.weatherDataSource.asObservable();

  private userSettingsSource = new BehaviorSubject<any>(null);
  userSettings$ = this.userSettingsSource.asObservable();

  constructor() { }

  setWeatherData(data: any) {
    this.weatherDataSource.next(data);
  }

  setUserSettings(settings: any) {
    this.userSettingsSource.next(settings);
  }
}
