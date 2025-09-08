import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideItemComponent } from './side-item.component';

describe('SideItemComponent', () => {
  let component: SideItemComponent;
  let fixture: ComponentFixture<SideItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
