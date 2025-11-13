import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlipcardstartComponent } from './flipcardstart.component';

describe('FlipcardstartComponent', () => {
  let component: FlipcardstartComponent;
  let fixture: ComponentFixture<FlipcardstartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlipcardstartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlipcardstartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
