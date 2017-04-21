import { TestBed, inject } from '@angular/core/testing';

import { CalendarBookViewcontrollerService } from './calendar-book-viewcontroller.service';

describe('CalendarBookViewcontrollerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CalendarBookViewcontrollerService]
    });
  });

  it('should ...', inject([CalendarBookViewcontrollerService], (service: CalendarBookViewcontrollerService) => {
    expect(service).toBeTruthy();
  }));
});
