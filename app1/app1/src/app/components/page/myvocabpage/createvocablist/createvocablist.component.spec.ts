import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatevocablistComponent } from './createvocablist.component'; 

describe('CreatevocablistComponent', () => {
  let component: CreatevocablistComponent;
  let fixture: ComponentFixture<CreatevocablistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatevocablistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatevocablistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
