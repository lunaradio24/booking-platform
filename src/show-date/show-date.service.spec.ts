import { Test, TestingModule } from '@nestjs/testing';
import { ShowDateService } from './show-date.service';

describe('ShowDateService', () => {
  let service: ShowDateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShowDateService],
    }).compile();

    service = module.get<ShowDateService>(ShowDateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
