import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerInfoComponent } from './banner-info.component';

describe('BannerInfoComponent', () => {
  let component: BannerInfoComponent;
  let fixture: ComponentFixture<BannerInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
