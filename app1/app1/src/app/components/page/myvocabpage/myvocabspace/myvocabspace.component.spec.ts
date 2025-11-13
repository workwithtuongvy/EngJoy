import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyVocabSpaceComponent } from './myvocabspace.component';

describe('MyVocabSpaceComponent', () => {
  let component: MyVocabSpaceComponent;
  let fixture: ComponentFixture<MyVocabSpaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyVocabSpaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyVocabSpaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
