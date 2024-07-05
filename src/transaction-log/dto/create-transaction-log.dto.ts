import { IsNotEmpty, IsNumber } from 'class-validator';
import { TransactionType } from '../types/transaction-type.type';

export class CreateTransactionLogDto {
  @IsNumber()
  @IsNotEmpty({ message: '보내는 사용자의 ID를 입력해주세요.' })
  readonly senderId: number;

  @IsNumber()
  @IsNotEmpty({ message: '받는 사용자의 ID를 입력해주세요.' })
  readonly receiverId: number;

  @IsNotEmpty({ message: '거래 종류를 입력해주세요.' })
  readonly type: TransactionType;

  @IsNumber()
  @IsNotEmpty({ message: '거래 금액을 입력해주세요.' })
  readonly amount: number;
}
