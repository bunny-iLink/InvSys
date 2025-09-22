import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Purchaseorders } from './purchaseorders';

describe('Purchaseorders', () => {
  let component: Purchaseorders;
  let fixture: ComponentFixture<Purchaseorders>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Purchaseorders]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Purchaseorders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
