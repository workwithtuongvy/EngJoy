import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordSetDetailPopupComponent } from './word-set-detail-popup.component';

describe('WordSetDetailPopupComponent', () => {
  let component: WordSetDetailPopupComponent;
  let fixture: ComponentFixture<WordSetDetailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordSetDetailPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordSetDetailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
