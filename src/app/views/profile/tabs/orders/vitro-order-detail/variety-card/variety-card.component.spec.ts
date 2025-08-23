import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarietyCardComponent } from './variety-card.component';

describe('VarietyCardComponent', () => {
  let component: VarietyCardComponent;
  let fixture: ComponentFixture<VarietyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarietyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VarietyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
