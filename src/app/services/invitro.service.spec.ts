import { TestBed } from '@angular/core/testing';

import { InvitroService } from './invitro.service';

describe('InvitroService', () => {
  let service: InvitroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvitroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
