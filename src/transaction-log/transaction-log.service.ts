import { Injectable } from '@nestjs/common';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';
import { UpdateTransactionLogDto } from './dto/update-transaction-log.dto';

@Injectable()
export class TransactionLogService {
  create(createTransactionLogDto: CreateTransactionLogDto) {
    return 'This action adds a new transactionLog';
  }

  findAll() {
    return `This action returns all transactionLog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transactionLog`;
  }

  update(id: number, updateTransactionLogDto: UpdateTransactionLogDto) {
    return `This action updates a #${id} transactionLog`;
  }

  remove(id: number) {
    return `This action removes a #${id} transactionLog`;
  }
}
