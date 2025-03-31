import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PreferenceService } from '../services/preference.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  currentDate: number = new Date().setHours(0,0,0,0);
  userSettings: any;

  constructor(
    private router: Router,
    private preferenceService: PreferenceService,
    private themeService: ThemeService
  ) {
    
  }

  ngOnInit() {
  }

  goToNav() {
    this.router.navigate(['/navigation']);
  }
}
