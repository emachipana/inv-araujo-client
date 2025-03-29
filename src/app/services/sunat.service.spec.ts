import { TestBed } from '@angular/core/testing';

import { SunatService } from './sunat.service';

describe('SunatService', () => {
  let service: SunatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SunatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
