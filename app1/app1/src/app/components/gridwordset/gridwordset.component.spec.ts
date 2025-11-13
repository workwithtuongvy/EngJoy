import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridwordsetComponent } from './gridwordset.component';

describe('GridwordsetComponent', () => {
  let component: GridwordsetComponent;
  let fixture: ComponentFixture<GridwordsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridwordsetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridwordsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
