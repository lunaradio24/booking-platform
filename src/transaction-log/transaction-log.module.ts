import { Module } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { TransactionLogController } from './transaction-log.controller';
import { TransactionLog } from './entities/transaction-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionLog])],
  controllers: [TransactionLogController],
  providers: [TransactionLogService],
  exports: [TransactionLogService],
})
export class TransactionLogModule {}
