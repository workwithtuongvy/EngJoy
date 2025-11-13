import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadergameComponent } from './headergame.component';

describe('HeadergameComponent', () => {
  let component: HeadergameComponent;
  let fixture: ComponentFixture<HeadergameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadergameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadergameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
