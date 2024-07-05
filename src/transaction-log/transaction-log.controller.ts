import { Controller, Get } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';

@Controller('transaction-log')
export class TransactionLogController {
  constructor(private readonly transactionLogService: TransactionLogService) {}

  @Get()
  async findAll() {
    return this.transactionLogService.findAll();
  }
}
