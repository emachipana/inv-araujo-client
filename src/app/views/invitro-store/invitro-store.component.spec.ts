import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitroStoreComponent } from './invitro-store.component';

describe('InvitroStoreComponent', () => {
  let component: InvitroStoreComponent;
  let fixture: ComponentFixture<InvitroStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitroStoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitroStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
