import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionLog } from './entities/transaction-log.entity';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';

@Injectable()
export class TransactionLogService {
  constructor(
    @InjectRepository(TransactionLog)
    private readonly transactionLogRepository: Repository<TransactionLog>,
  ) {}

  async create(createTransactionLogDto: CreateTransactionLogDto) {
    await this.transactionLogRepository.save(createTransactionLogDto);
  }

  async findAll() {
    return `This action returns all transactionLog`;
  }
}
