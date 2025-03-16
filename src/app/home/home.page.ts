import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  location: any = {};
  currentDate: number = new Date().setHours(0,0,0,0);

  constructor(
    private weatherService: WeatherService,
    private locationService: LocationService
  ) {
    
  }

  async ngOnInit() {
    this.location = await this.locationService.getCurrentLocation();
  }

  getCurrentWeatherReport(lat: number, lon: number) {
    this.weatherService.getCurrentWeather(lat, lon).subscribe(
      (data) => {
        console.log(data);
      },
      (error) => {
        alert("Unable to get current weather report as of this moment: "+error);
      }
    )
  }
}
