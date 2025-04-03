import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {
  private initStatus = new BehaviorSubject<boolean>(false);

  constructor() { }

  initComplete() {
    this.initStatus.next(true);
  }

  getInitStatus() {
    return this.initStatus.asObservable();
  }
}
