import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharableThingShowcaseCalendarComponent } from './sharable-thing-showcase-calendar.component';

describe('SharableThingShowcaseCalendarComponent', () => {
  let component: SharableThingShowcaseCalendarComponent;
  let fixture: ComponentFixture<SharableThingShowcaseCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharableThingShowcaseCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharableThingShowcaseCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
