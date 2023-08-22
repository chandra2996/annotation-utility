import { TestBed } from '@angular/core/testing';

import { RandomColorGeneratorService } from './random-color-generator.service';

describe('RandomColorGeneratorService', () => {
  let service: RandomColorGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomColorGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
