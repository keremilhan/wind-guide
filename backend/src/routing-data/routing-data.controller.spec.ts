import { Test, TestingModule } from '@nestjs/testing';
import { RoutingDataController } from './routing-data.controller';

describe('RoutingDataController', () => {
  let controller: RoutingDataController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutingDataController],
    }).compile();

    controller = module.get<RoutingDataController>(RoutingDataController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
