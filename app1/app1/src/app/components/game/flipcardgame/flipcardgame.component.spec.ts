import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlipcardgameComponent } from './flipcardgame.component';

describe('FcdarkComponent', () => {
  let component: FlipcardgameComponent;
  let fixture: ComponentFixture<FlipcardgameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlipcardgameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlipcardgameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
