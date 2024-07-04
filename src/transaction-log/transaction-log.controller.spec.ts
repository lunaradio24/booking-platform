import { Test, TestingModule } from '@nestjs/testing';
import { TransactionLogController } from './transaction-log.controller';
import { TransactionLogService } from './transaction-log.service';

describe('TransactionLogController', () => {
  let controller: TransactionLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionLogController],
      providers: [TransactionLogService],
    }).compile();

    controller = module.get<TransactionLogController>(TransactionLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
