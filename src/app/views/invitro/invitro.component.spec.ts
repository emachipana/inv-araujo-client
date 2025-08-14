import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitroComponent } from './invitro.component';

describe('InvitroComponent', () => {
  let component: InvitroComponent;
  let fixture: ComponentFixture<InvitroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
