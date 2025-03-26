import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherforecastPage } from './weatherforecast.page';

describe('WeatherforecastPage', () => {
  let component: WeatherforecastPage;
  let fixture: ComponentFixture<WeatherforecastPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherforecastPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
