import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Swap } from './swap';

describe('Swap', () => {
  let component: Swap;
  let fixture: ComponentFixture<Swap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Swap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Swap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
