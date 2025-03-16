import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async getCurrentLocation() {
    try{
      const coordinates = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coordinates.coords;
      return {latitude, longitude};
    }catch(error) {
      alert("Unable to get current location as of this moment: "+error);
      return null;
    }
  }
}
