import { TestBed } from '@angular/core/testing';

import { DeepseekApiService } from './deepseek-api.service';

describe('DeepseekApiService', () => {
  let service: DeepseekApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeepseekApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
