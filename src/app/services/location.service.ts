import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locationSubject = new BehaviorSubject<{ lat: number, lon: number } | null>(null);
  location$: Observable<{ lat: number; lon: number } | null> = this.locationSubject.asObservable();

  constructor() { }

  async startWatchingPosition() {
    await Geolocation.requestPermissions();

    Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, err) => {
        if(err) {
          console.error('Error watching current position: ', err);
          return;
        }
        if(position) {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          this.locationSubject.next(coords);
          console.log('Location updated: ', coords)
        }
      }
    )
  }

  async getCurrentPosition() {
    const position = await Geolocation.getCurrentPosition();
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };
  }

}
