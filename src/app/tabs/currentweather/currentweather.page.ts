import { Component, OnInit } from '@angular/core';
import { WeatherService } from 'src/app/services/weather.service';
import { LocationService } from 'src/app/services/location.service';

@Component({
  selector: 'app-currentweather',
  templateUrl: './currentweather.page.html',
  styleUrls: ['./currentweather.page.scss'],
  standalone: false
})
export class CurrentweatherPage implements OnInit {
  currentWeather: any;
  location: any = null;
  locationSched : any = null;
  locationInterval: number = (5 * 60) * 1000

  constructor(
    private weatherService: WeatherService, 
    private locationService: LocationService
  ) { }

  async ngOnInit() {
    await this.startLocationMonitoring(this.locationInterval)
    if(this.location) {
    }
  }

  async startLocationMonitoring(interval: number) {
    if(this.locationSched) {
      return;
    }
    
    this.location = await this.locationService.getCurrentLocation()
    this.locationSched = setInterval(async () => {
      this.location = await this.locationService.getCurrentLocation();
      console.log(this.location)
    }, interval);
  }



}
