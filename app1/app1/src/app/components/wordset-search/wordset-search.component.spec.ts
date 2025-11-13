import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordsetSearchComponent } from './wordset-search.component';

describe('WordsetSearchComponent', () => {
  let component: WordsetSearchComponent;
  let fixture: ComponentFixture<WordsetSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordsetSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordsetSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
