import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsearchstartComponent } from './wordsearchstart.component';

describe('WordsearchstartComponent', () => {
  let component: WordsearchstartComponent;
  let fixture: ComponentFixture<WordsearchstartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsearchstartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordsearchstartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
