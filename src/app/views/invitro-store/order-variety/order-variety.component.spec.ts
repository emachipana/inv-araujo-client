import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderVarietyComponent } from './order-variety.component';

describe('OrderVarietyComponent', () => {
  let component: OrderVarietyComponent;
  let fixture: ComponentFixture<OrderVarietyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderVarietyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderVarietyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
