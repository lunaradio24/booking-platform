import { PartialType } from '@nestjs/mapped-types';
import { CreateTransactionLogDto } from './create-transaction-log.dto';

export class UpdateTransactionLogDto extends PartialType(CreateTransactionLogDto) {}
