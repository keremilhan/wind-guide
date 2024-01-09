import { Test, TestingModule } from '@nestjs/testing';
import { RoutingDataService } from './routing-data.service';

describe('RoutingDataService', () => {
  let service: RoutingDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoutingDataService],
    }).compile();

    service = module.get<RoutingDataService>(RoutingDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
