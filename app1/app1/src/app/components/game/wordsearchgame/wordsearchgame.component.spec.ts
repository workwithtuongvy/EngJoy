import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsearchgameComponent } from './wordsearchgame.component';

describe('WordsearchgameComponent', () => {
  let component: WordsearchgameComponent;
  let fixture: ComponentFixture<WordsearchgameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsearchgameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordsearchgameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
