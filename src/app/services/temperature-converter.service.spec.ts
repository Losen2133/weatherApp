import { TestBed } from '@angular/core/testing';

import { TemperatureConverterService } from './temperature-converter.service';

describe('TemperatureConverterService', () => {
  let service: TemperatureConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemperatureConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
