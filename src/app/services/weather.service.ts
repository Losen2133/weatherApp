import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = 'de2ed4263072d55e835522e8a1084c6d';
  private currentWeatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private dailyWeatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast/daily';
  private hourlyWeatherApiUrl = 'https://pro.openweathermap.org/data/2.5/forecast/hourly';


  constructor(private http: HttpClient) { }

  getCurrentWeather(lat: any, lon: any): Observable<any> {
    const url = `${this.currentWeatherApiUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
    return this.http.get(url);
  }

  getDailyWeather(lat: any, lon: any, count: number): Observable<any> {
    const url = `${this.dailyWeatherApiUrl}?lat=${lat}&lon=${lon}&cnt=${count}&appid=${this.apiKey}`;
    return this.http.get(url);
  }

  getHourlyWeather(lat: any, lon: any, count: number): Observable<any> {
    const url = `${this.hourlyWeatherApiUrl}?lat=${lat}&lon=${lon}&cnt=${count}&appid=${this.apiKey}`;
    return this.http.get(url);
  }
}
