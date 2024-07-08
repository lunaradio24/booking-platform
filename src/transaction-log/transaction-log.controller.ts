import { Controller, Get, UseGuards } from '@nestjs/common';
import { TransactionLogService } from './transaction-log.service';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/utils/decorators/roles.decorator';

@Controller('transaction-logs')
export class TransactionLogController {
  constructor(private readonly transactionLogService: TransactionLogService) {}

  @Get()
  @UseGuards(AccessTokenGuard, RoleGuard)
  @Roles(['ADMIN'])
  async findAll() {
    return this.transactionLogService.findAll();
  }
}
