import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrentweatherPage } from './currentweather.page';

describe('CurrentweatherPage', () => {
  let component: CurrentweatherPage;
  let fixture: ComponentFixture<CurrentweatherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentweatherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
