import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharableThingShowcaseComponent } from './sharable-thing-showcase.component';

describe('SharableThingShowcaseComponent', () => {
  let component: SharableThingShowcaseComponent;
  let fixture: ComponentFixture<SharableThingShowcaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharableThingShowcaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharableThingShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
