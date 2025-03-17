import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = environment.secretEnvironment.OPENWEATHERMAP_API_KEY;
  private currentWeatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private dailyWeatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast/daily';
  private hourlyWeatherApiUrl = 'https://pro.openweathermap.org/data/2.5/forecast/hourly';


  constructor(private http: HttpClient) { }

  getCurrentWeather(lat: any, lon: any, units: string = 'metric'): Observable<any> {
    const url = `${this.currentWeatherApiUrl}?lat=${lat}&lon=${lon}&units=${units}&appid=${this.apiKey}`;
    return this.http.get(url);
  }

  getDailyWeather(lat: any, lon: any, count: number, units: string = 'metric'): Observable<any> {
    const url = `${this.dailyWeatherApiUrl}?lat=${lat}&lon=${lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`;
    return this.http.get(url);
  }

  getHourlyWeather(lat: any, lon: any, count: number, units: string = 'metric'): Observable<any> {
    const url = `${this.hourlyWeatherApiUrl}?lat=${lat}&lon=${lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`;
    return this.http.get(url);
  }
}
