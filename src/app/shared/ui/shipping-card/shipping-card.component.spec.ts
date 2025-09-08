import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingCardComponent } from './shipping-card.component';

describe('ShippingCardComponent', () => {
  let component: ShippingCardComponent;
  let fixture: ComponentFixture<ShippingCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShippingCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShippingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
