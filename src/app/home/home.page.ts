import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  location: any = {};


  constructor() {
    this.getCurrentLocation();
  }

  async getCurrentLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      this.location.latitude = latitude;
      this.location.longitude = longitude;
    } catch(error) {
      alert("Unable to get current location as of this moment: "+error);
    }
  }

  async getCurrentWeatherReport() {
    try {
      
    } catch(error) {
      alert("Unable to get current weather report as of this moment: "+error);
    }
  }
}
