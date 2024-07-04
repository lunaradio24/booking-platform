import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { CreateTransactionLogDto } from './dto/create-transaction-log.dto';
import { UpdateTransactionLogDto } from './dto/update-transaction-log.dto';

@Controller('transaction-log')
export class TransactionLogController {
  constructor(private readonly transactionLogService: TransactionLogService) {}

  @Post()
  create(@Body() createTransactionLogDto: CreateTransactionLogDto) {
    return this.transactionLogService.create(createTransactionLogDto);
  }

  @Get()
  findAll() {
    return this.transactionLogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionLogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionLogDto: UpdateTransactionLogDto) {
    return this.transactionLogService.update(+id, updateTransactionLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionLogService.remove(+id);
  }
}
